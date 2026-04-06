import axios from 'axios';
import { API_BASE_URL } from '@/utils/constants';

const API_URL = `${API_BASE_URL}/compare`;

/**
 * Retrieves authentication headers from localStorage.
 * Extracts the JWT token from the stored user object.
 * 
 * @returns An object containing the Authorization header, or an empty object if no user is found.
 */
const getAuthHeaders = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return {};
    const user = JSON.parse(userStr);
    return { Authorization: `Bearer ${user.token}` };
};

export interface RepoSource {
  url: string;
  branch: string;
  nickname?: string;
}

export interface ComparisonRequest {
  sources: RepoSource[];
  baseRepoUrl: string;
  baseBranch: string;
}

/**
 * Service for interacting with the Comparison backend API.
 * Handles Git repository comparisons and history retrieval.
 */
export const compareService = {
  /**
   * Triggers a new comparison between two branches of a repository.
   * 
   * @param request - Object containing repoUrlA, repoUrlB, branchA, and branchB.
   * @returns Detailed comparison result object.
   */
  compare: async (request: ComparisonRequest) => {
    const response = await axios.post(API_URL, request, { headers: getAuthHeaders() });
    return response.data;
  },

  /**
   * Fetches the complete comparison history for the authenticated user.
   * 
   * @returns Array of comparison history items.
   */
  getHistory: async () => {
    const response = await axios.get(`${API_URL}/history`, { headers: getAuthHeaders() });
    return response.data;
  },

  /**
   * Retrieves summary statistics for the user's dashboard.
   * 
   * @returns Stats object including total comparisons, additions, deletions, etc.
   */
  getStats: async () => {
    const response = await axios.get(`${API_URL}/stats`, { headers: getAuthHeaders() });
    return response.data;
  },

  /**
   * Fetches a specific comparison result by its unique ID.
   * 
   * @param id - The ID of the comparison record.
   * @returns The full comparison result object.
   */
  getById: async (id: string) => {
    const response = await axios.get(`${API_URL}/${id}`, { headers: getAuthHeaders() });
    return response.data;
  }
};
