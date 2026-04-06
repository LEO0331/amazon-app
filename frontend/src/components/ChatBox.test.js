/* @vitest-environment jsdom */
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import ChatBox from './ChatBox';
import apiClient from '../apiClient';

vi.mock('../apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

beforeEach(() => {
  vi.useFakeTimers();
  apiClient.get.mockReset();
  apiClient.post.mockReset();
  window.HTMLElement.prototype.scrollBy = vi.fn();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('ChatBox', () => {
  it('opens thread and sends a message successfully', async () => {
    apiClient.post
      .mockResolvedValueOnce({ data: { _id: 't1' } })
      .mockResolvedValueOnce({ data: { ok: true } });
    apiClient.get
      .mockResolvedValueOnce({ data: [{ _id: 'm1', name: 'Support', body: 'Welcome back' }] })
      .mockResolvedValue({ data: [{ _id: 'm2', name: 'Support', body: 'Ping' }] });

    render(<ChatBox userInfo={{ _id: 'u1', name: 'Leo' }} />);
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith('/api/support/threads', { userId: 'u1' }));
    expect(screen.getByText('Support Inbox')).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText('Please type message'), { target: { value: 'Hello' } });
    fireEvent.click(screen.getByText('Send'));
    await waitFor(() =>
      expect(apiClient.post).toHaveBeenCalledWith('/api/support/threads/t1/messages', { body: 'Hello' })
    );
  });

  it('shows fallback message when opening thread fails', async () => {
    apiClient.post.mockRejectedValueOnce(new Error('down'));
    render(<ChatBox userInfo={{ _id: 'u2', name: 'Amy' }} />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(screen.getByText(/temporarily unavailable/i)).toBeTruthy());
  });

  it('shows fallback message when sending fails', async () => {
    apiClient.post
      .mockResolvedValueOnce({ data: { _id: 't2' } })
      .mockRejectedValueOnce(new Error('send fail'));
    apiClient.get.mockResolvedValue({ data: [] });

    render(<ChatBox userInfo={{ _id: 'u3', name: 'Ben' }} />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(apiClient.post).toHaveBeenCalledWith('/api/support/threads', { userId: 'u3' }));

    fireEvent.change(screen.getByPlaceholderText('Please type message'), { target: { value: 'Need help' } });
    fireEvent.click(screen.getByText('Send'));
    await waitFor(() => expect(screen.getByText(/Failed to send message/i)).toBeTruthy());
  });
});
