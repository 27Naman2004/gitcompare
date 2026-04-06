'use client';

import { useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/utils/constants';

export const KeepAlive = () => {
  useEffect(() => {
    const ping = async () => {
      try {
        await axios.get(`${API_BASE_URL}/api/public/awake`);
        console.log('Keep-alive ping sent successfully');
      } catch (err) {
        console.error('Keep-alive ping failed', err);
      }
    };

    // Ping every 14 minutes (Render sleeps after 15)
    const interval = setInterval(ping, 14 * 60 * 1000);
    
    // Initial ping on mount
    ping();

    return () => clearInterval(interval);
  }, []);

  return null;
};
