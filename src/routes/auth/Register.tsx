import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, User, Phone, FileText, Check, X } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'

const registerSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),
  email: z.string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  phone: z.string()
    .regex(/^(\+\d{1,3}[- ]?)?\d{10}$/, 'Please enter a valid phone number')
    .optional(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  confirmPassword: z.string()
    .min(1, 'Please confirm your password'),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

const Register = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  })

  const password = form.watch('password')
  
  const passwordValidations = [
    { test: password.length >= 8, text: 'At least 8 characters' },
    { test: /[A-Z]/.test(password), text: 'One uppercase letter' },
    { test: /[a-z]/.test(password), text: 'One lowercase letter' },
    { test: /\d/.test(password), text: 'One number' },
    { test: /[@$!%*?&]/.test(password), text: 'One special character' },
  ]

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    try {
      console.log('Register data:', data)
      // Add your registration logic here
    } catch (error) {
      console.error('Registration error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">

        <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-gray-900 dark:text-white">Create Account</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Fill in your details to create a new account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">First Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              type="text"
                              placeholder="First name"
                              className="pl-10 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">Last Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              type="text"
                              placeholder="Last name"
                              className="pl-10 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Email Field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            className="pl-10 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone Field */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">Phone (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            type="tel"
                            placeholder="+1234567890"
                            className="pl-10 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Create a password"
                            className="pl-10 pr-10 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                      
                      {/* Password Requirements */}
                      {password && (
                        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password requirements:</p>
                          <div className="space-y-1">
                            {passwordValidations.map((validation, index) => (
                              <div key={index} className="flex items-center text-xs">
                                {validation.test ? (
                                  <Check className="w-3 h-3 text-green-500 mr-2" />
                                ) : (
                                  <X className="w-3 h-3 text-red-500 mr-2" />
                                )}
                                <span className={validation.test ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                                  {validation.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                {/* Confirm Password Field */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Confirm your password"
                            className="pl-10 pr-10 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-purple-500 dark:focus:border-purple-400"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Terms and Conditions */}
                <FormField
                  control={form.control}
                  name="agreeToTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 mt-1"
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <label className="text-sm text-gray-600 dark:text-gray-400">
                          I agree to the{' '}
                          <Link to="/terms" className="text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 underline">
                            Terms of Service
                          </Link>{' '}
                          and{' '}
                          <Link to="/privacy" className="text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 underline">
                            Privacy Policy
                          </Link>
                        </label>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating account...
                    </div>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="justify-center pt-4 border-t border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>

    </div>
  )
}

export default Register