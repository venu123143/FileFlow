
export const USER_ROLES = {
    USER: 'USER',
    ADMIN: 'ADMIN',
} as const;

export interface JwtToken {
    jwt_token: string;
    expiresAt: number
}
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export interface IUser {
    id: string;
    email: string;
    role: UserRole;
    password_hash: string;
    display_name?: string;
    avatar_url?: string;
    storage_quota: number;
    last_login?: Date;
    is_active: boolean;
    email_verified: boolean;
    two_factor_enabled: boolean;
    preferences: Record<string, any>;
}

export interface SignupDto {
    email: string;
    password: string;
    display_name?: string;
    avatar_url?: string;
}


export interface IUserListItem {
    id: string;
    email: string;
    display_name: string | null;
    avatar_url: string | null;
    created_at: string; // or Date if you convert it before returning
}


export interface GetAllUsersAttributes {
    page: number;
    limit: number;
    search: string;
    is_active: boolean;
    email_verified: boolean;
}
