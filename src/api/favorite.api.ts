import apiClient from "@/api/axios";
import type { FileSystemNode } from "@/types/file.types";

export interface FavoriteRecord {
    id: string;
    user_id: string;
    file_id: string;
    created_at: string;
    file?: FileSystemNode;
}

export interface GetFavoritesParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: 'created_at' | 'name';
    sortOrder?: 'ASC' | 'DESC';
}

export interface GetFavoritesResponse {
    favorites: FavoriteRecord[];
    metadata: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

const createFavorite = async (data: { file_id?: string; storage_path?: string }): Promise<FavoriteRecord> => {
    const response = await apiClient.post("/favorite", data);
    return response.data.data.favorite;
};

const getFavorites = async (params: GetFavoritesParams = {}): Promise<GetFavoritesResponse> => {
    const response = await apiClient.get("/favorite", {
        params: {
            page: params.page ?? 1,
            limit: params.limit ?? 100,
            search: params.search,
            sortBy: params.sortBy ?? 'created_at',
            sortOrder: params.sortOrder ?? 'DESC',
        },
    });
    return response.data.data;
};

const getAllFavorites = async (params: Omit<GetFavoritesParams, 'page'> = {}): Promise<FavoriteRecord[]> => {
    const limit = params.limit ?? 100;
    const firstPage = await getFavorites({ ...params, page: 1, limit });
    const favorites = [...firstPage.favorites];

    for (let page = 2; page <= firstPage.metadata.totalPages; page += 1) {
        const response = await getFavorites({ ...params, page, limit });
        favorites.push(...response.favorites);
    }

    return favorites;
};

const deleteFavorite = async (favoriteId: string) => {
    const response = await apiClient.delete(`/favorite/${favoriteId}`);
    return response.data;
};

const deleteFavoriteByFileId = async (fileId: string) => {
    const response = await apiClient.delete(`/favorite/file/${fileId}`);
    return response.data;
};

export default {
    createFavorite,
    getFavorites,
    getAllFavorites,
    deleteFavorite,
    deleteFavoriteByFileId,
};
