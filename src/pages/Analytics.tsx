import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { format, subDays } from "date-fns"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ArrowDownRight, ArrowUpRight, Download, Link2, RefreshCw, Share2, Upload } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useDashboard } from "@/contexts/DashboardContext"
import analyticsApi from "@/api/analytics.api"
import { cn, formatFileSize } from "@/lib/utils"

/* Chart colors: categorical slots 1-3, validated for light and dark surfaces */
const chartTheme = `
.viz {
  --series-1: #2a78d6; --series-2: #eb6834; --series-3: #1baf7a;
  --viz-grid: #e1e0d9; --viz-axis: #c3c2b7; --viz-muted: #898781;
}
.dark .viz {
  --series-1: #3987e5; --series-2: #d95926; --series-3: #199e70;
  --viz-grid: #2c2c2a; --viz-axis: #383835;
}
`

const RANGES = [7, 30, 90] as const
type Range = (typeof RANGES)[number]

interface DayRow {
  date: string
  uploads_today: number
  downloads_today: number
  shares_created_today: number
  public_links_created_today: number
  total_size: number
}

const dayKey = (d: Date) => format(d, "yyyy-MM-dd")

/** The API only stores days with activity, so fill the gaps to get a continuous axis. */
function fillDays(rows: DayRow[], days: number, endOffset = 0): DayRow[] {
  const byDate = new Map(rows.map((r) => [String(r.date).slice(0, 10), r]))
  const out: DayRow[] = []
  let lastSize = 0
  // seed with the first known size so the line doesn't start at zero
  const first = [...byDate.values()].sort((a, b) => String(a.date).localeCompare(String(b.date)))[0]
  if (first) lastSize = Number(first.total_size) || 0

  for (let i = days - 1 + endOffset; i >= endOffset; i--) {
    const key = dayKey(subDays(new Date(), i))
    const row = byDate.get(key)
    if (row?.total_size !== undefined) lastSize = Number(row.total_size)
    out.push({
      date: key,
      uploads_today: Number(row?.uploads_today) || 0,
      downloads_today: Number(row?.downloads_today) || 0,
      shares_created_today: Number(row?.shares_created_today) || 0,
      public_links_created_today: Number(row?.public_links_created_today) || 0,
      total_size: lastSize,
    })
  }
  return out
}

const sum = (rows: DayRow[], key: keyof DayRow) => rows.reduce((s, r) => s + (Number(r[key]) || 0), 0)
const shortDate = (key: string) => format(new Date(`${key}T00:00:00`), "MMM d")

/* ---------- small building blocks ---------- */

function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-2">
          <span className="h-0.5 w-4 rounded-full" style={{ background: i.color }} aria-hidden />
          {i.label}
        </li>
      ))}
    </ul>
  )
}

function ChartTooltip({ active, payload, label, valueFormat }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="mb-1 font-medium">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.stroke }} aria-hidden />
            {p.name}
          </span>
          <span className="font-medium tabular-nums">{valueFormat ? valueFormat(p.value, p) : p.value}</span>
        </div>
      ))}
    </div>
  )
}

const axisProps = {
  tick: { fontSize: 12, fill: "var(--viz-muted)" },
  tickLine: false,
  axisLine: { stroke: "var(--viz-axis)" },
}

function Delta({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) {
    return <span className="text-xs text-muted-foreground">{current > 0 ? "New activity" : "No activity yet"}</span>
  }
  const pct = Math.round(((current - previous) / previous) * 100)
  if (pct === 0) return <span className="text-xs text-muted-foreground">No change</span>
  const Icon = pct > 0 ? ArrowUpRight : ArrowDownRight
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {Math.abs(pct)}% vs previous period
    </span>
  )
}

function Stat({ icon: Icon, label, value, previous }: { icon: any; label: string; value: number; previous: number }) {
  return (
    <Card>
      <CardContent className="space-y-2 p-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon className="h-4 w-4" aria-hidden />
          {label}
        </div>
        <p className="text-3xl font-semibold tracking-tight">{value.toLocaleString()}</p>
        <Delta current={value} previous={previous} />
      </CardContent>
    </Card>
  )
}

/* ---------- page ---------- */

export function Analytics() {
  const { storageOverview, analyticsSummary, isLoading, error, refreshStorageOverview, refreshAnalyticsSummary } = useDashboard()
  const [range, setRange] = useState<Range>(30)
  const [refreshing, setRefreshing] = useState(false)

  const end = dayKey(new Date())
  const start = dayKey(subDays(new Date(), range - 1))
  const prevEnd = dayKey(subDays(new Date(), range))
  const prevStart = dayKey(subDays(new Date(), range * 2 - 1))

  // 30 days is already loaded by the dashboard summary; other ranges use the date-range endpoint
  const useSummary = range === 30 && !!analyticsSummary
  const currentQuery = useQuery({
    queryKey: ["analyticsRange", start, end],
    queryFn: async () => (await analyticsApi.getAnalyticsByDateRange(start, end)).data as DayRow[],
    enabled: !useSummary,
  })
  const previousQuery = useQuery({
    queryKey: ["analyticsRange", prevStart, prevEnd],
    queryFn: async () => (await analyticsApi.getAnalyticsByDateRange(prevStart, prevEnd)).data as DayRow[],
  })

  const rawCurrent: DayRow[] | undefined = useSummary ? analyticsSummary!.last30Days : currentQuery.data
  const days = useMemo(() => {
    if (!rawCurrent) return null
    const rows = fillDays(rawCurrent, range)
    // today's size is known exactly from the live storage overview
    if (storageOverview && rows.length) rows[rows.length - 1]!.total_size = storageOverview.storage.totalSize
    return rows
  }, [rawCurrent, range, storageOverview])
  const prevDays = useMemo(
    () => (previousQuery.data ? fillDays(previousQuery.data, range, range) : null),
    [previousQuery.data, range]
  )

  const typeData = useMemo(() => {
    if (!storageOverview) return []
    const s = storageOverview.storage
    return [
      { name: "Images", size: s.imageSize, count: s.imageCount },
      { name: "Videos", size: s.videoSize, count: s.videoCount },
      { name: "Audio", size: s.audioSize, count: s.audioCount },
      { name: "Documents", size: s.documentSize, count: s.documentCount },
      { name: "Other", size: s.otherSize ?? 0, count: s.otherCount ?? 0 },
    ].sort((a, b) => b.size - a.size)
  }, [storageOverview])

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([refreshStorageOverview(), refreshAnalyticsSummary(), currentQuery.refetch(), previousQuery.refetch()])
      toast.success("Analytics updated")
    } catch {
      toast.error("Couldn't refresh analytics. Try again.")
    } finally {
      setRefreshing(false)
    }
  }

  const loading = isLoading || !days
  const percent = storageOverview ? Math.min(parseFloat(storageOverview.storageUsedPercentage), 100) : 0

  return (
    <div className="viz mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
      <style>{chartTheme}</style>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">How much space you use and what happens to your files.</p>
        </div>
        <div className="flex items-center gap-2">
          <div role="group" aria-label="Time range" className="inline-flex rounded-md border p-0.5">
            {RANGES.map((r) => (
              <Button
                key={r}
                size="sm"
                variant={range === r ? "secondary" : "ghost"}
                aria-pressed={range === r}
                onClick={() => setRange(r)}
                className="h-8 px-3"
              >
                {r} days
              </Button>
            ))}
          </div>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing} aria-label="Refresh analytics">
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          </Button>
        </div>
      </header>

      {error && (
        <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Couldn't load analytics: {error}
        </p>
      )}

      {/* Storage */}
      <Card>
        <CardContent className="space-y-4 p-6">
          {!storageOverview ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <>
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">Storage used</p>
                  <p className="text-3xl font-semibold tracking-tight">
                    {formatFileSize(storageOverview.storageUsed)}
                    <span className="ml-2 text-base font-normal text-muted-foreground">of {formatFileSize(storageOverview.storageQuota)}</span>
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(Math.max(storageOverview.storageRemaining, 0))} free · {storageOverview.storage.totalFiles.toLocaleString()} files in{" "}
                  {storageOverview.storage.totalFolders.toLocaleString()} folders
                </p>
              </div>
              <Progress value={percent} aria-label="Storage used" />
              <dl className="grid grid-cols-2 gap-4 border-t pt-4 text-sm sm:grid-cols-4">
                {[
                  ["Uploaded today", storageOverview.todayActivity.uploads],
                  ["Downloaded today", storageOverview.todayActivity.downloads],
                  ["Shared today", storageOverview.todayActivity.shares],
                  ["Public links today", storageOverview.todayActivity.publicLinks],
                ].map(([label, value]) => (
                  <div key={label as string}>
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="text-lg font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </CardContent>
      </Card>

      {/* Totals for the selected range */}
      <section aria-label={`Totals for the last ${range} days`} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[116px]" />)
        ) : (
          <>
            <Stat icon={Upload} label="Uploads" value={sum(days!, "uploads_today")} previous={prevDays ? sum(prevDays, "uploads_today") : 0} />
            <Stat icon={Download} label="Downloads" value={sum(days!, "downloads_today")} previous={prevDays ? sum(prevDays, "downloads_today") : 0} />
            <Stat icon={Share2} label="Shares" value={sum(days!, "shares_created_today")} previous={prevDays ? sum(prevDays, "shares_created_today") : 0} />
            <Stat icon={Link2} label="Public links" value={sum(days!, "public_links_created_today")} previous={prevDays ? sum(prevDays, "public_links_created_today") : 0} />
          </>
        )}
      </section>

      {/* Activity */}
      <Card>
        <CardHeader className="gap-3">
          <div>
            <CardTitle>Activity</CardTitle>
            <CardDescription>Files uploaded, downloaded and shared each day.</CardDescription>
          </div>
          <Legend
            items={[
              { label: "Uploads", color: "var(--series-1)" },
              { label: "Downloads", color: "var(--series-2)" },
              { label: "Shares", color: "var(--series-3)" },
            ]}
          />
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <>
              <div className="h-64 w-full" role="img" aria-label={`Daily uploads, downloads and shares over the last ${range} days`}>
                <ResponsiveContainer>
                  <LineChart data={days!} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                    <CartesianGrid vertical={false} stroke="var(--viz-grid)" />
                    <XAxis dataKey="date" tickFormatter={shortDate} minTickGap={32} {...axisProps} />
                    <YAxis allowDecimals={false} width={48} {...axisProps} axisLine={false} />
                    <Tooltip
                      cursor={{ stroke: "var(--viz-axis)" }}
                      content={<ChartTooltip />}
                      labelFormatter={(l: string) => shortDate(l)}
                    />
                    <Line name="Uploads" dataKey="uploads_today" stroke="var(--series-1)" strokeWidth={2} dot={false} activeDot={{ r: 4, stroke: "var(--card)", strokeWidth: 2 }} />
                    <Line name="Downloads" dataKey="downloads_today" stroke="var(--series-2)" strokeWidth={2} dot={false} activeDot={{ r: 4, stroke: "var(--card)", strokeWidth: 2 }} />
                    <Line name="Shares" dataKey="shares_created_today" stroke="var(--series-3)" strokeWidth={2} dot={false} activeDot={{ r: 4, stroke: "var(--card)", strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <details className="mt-4 text-sm">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">View as table</summary>
                <div className="mt-3 max-h-64 overflow-auto rounded-md border">
                  <table className="w-full text-left">
                    <thead className="sticky top-0 bg-muted text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 font-medium">Date</th>
                        <th className="px-3 py-2 text-right font-medium">Uploads</th>
                        <th className="px-3 py-2 text-right font-medium">Downloads</th>
                        <th className="px-3 py-2 text-right font-medium">Shares</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...days!].reverse().map((d) => (
                        <tr key={d.date} className="border-t">
                          <td className="px-3 py-1.5">{shortDate(d.date)}</td>
                          <td className="px-3 py-1.5 text-right tabular-nums">{d.uploads_today}</td>
                          <td className="px-3 py-1.5 text-right tabular-nums">{d.downloads_today}</td>
                          <td className="px-3 py-1.5 text-right tabular-nums">{d.shares_created_today}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Storage over time */}
        <Card>
          <CardHeader>
            <CardTitle>Storage over time</CardTitle>
            <CardDescription>Total size of your files.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-60 w-full" />
            ) : (
              <div className="h-60 w-full" role="img" aria-label={`Storage used over the last ${range} days`}>
                <ResponsiveContainer>
                  <AreaChart data={days!} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="storageFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--series-1)" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="var(--series-1)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="var(--viz-grid)" />
                    <XAxis dataKey="date" tickFormatter={shortDate} minTickGap={32} {...axisProps} />
                    <YAxis tickFormatter={(v: number) => formatFileSize(v)} width={64} {...axisProps} axisLine={false} />
                    <Tooltip
                      cursor={{ stroke: "var(--viz-axis)" }}
                      content={<ChartTooltip valueFormat={(v: number) => formatFileSize(v)} />}
                      labelFormatter={(l: string) => shortDate(l)}
                    />
                    <Area name="Storage used" dataKey="total_size" type="monotone" stroke="var(--series-1)" strokeWidth={2} fill="url(#storageFill)" activeDot={{ r: 4, stroke: "var(--card)", strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* By file type */}
        <Card>
          <CardHeader>
            <CardTitle>Storage by file type</CardTitle>
            <CardDescription>Where your space goes.</CardDescription>
          </CardHeader>
          <CardContent>
            {!storageOverview ? (
              <Skeleton className="h-60 w-full" />
            ) : storageOverview.storage.totalSize === 0 ? (
              <p className="flex h-60 items-center justify-center text-sm text-muted-foreground">Upload a file to see how your storage is used.</p>
            ) : (
              <div className="h-60 w-full" role="img" aria-label="Storage used by file type">
                <ResponsiveContainer>
                  <BarChart data={typeData} layout="vertical" margin={{ top: 0, right: 72, bottom: 0, left: 8 }} barCategoryGap={12}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" width={84} {...axisProps} tick={{ fontSize: 13, fill: "currentColor" }} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: "var(--viz-grid)", opacity: 0.4 }}
                      content={<ChartTooltip valueFormat={(v: number, p: any) => `${formatFileSize(v)} · ${p.payload.count} files`} />}
                    />
                    <Bar name="Size" dataKey="size" fill="var(--series-1)" radius={[0, 4, 4, 0]} barSize={14}>
                      <LabelList dataKey="size" position="right" formatter={(v: number) => formatFileSize(v)} style={{ fontSize: 12, fill: "var(--viz-muted)" }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Analytics
