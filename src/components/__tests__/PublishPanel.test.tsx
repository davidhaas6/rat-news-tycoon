import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import PublishPanel, { DraftArticle } from '../PublishPanel';

describe('PublishPanel', () => {
  it('enforces topic max length and disables Publish when empty', () => {
    const onPublish = vi.fn();
    const onClose = vi.fn();
    render(<PublishPanel onPublish={onPublish} onClose={onClose} />);

    const topicInput = screen.getByPlaceholderText('Write a catchy headline...') as HTMLInputElement;
    const publishButton = screen.getByRole('button', { name: /publish/i }) as HTMLButtonElement;

    // Initially disabled because topic is empty
    expect(topicInput.value).toBe('');
    expect(publishButton).toBeDisabled();

    // Enter a valid topic
    fireEvent.change(topicInput, { target: { value: 'A good headline' } });
    expect(topicInput.value).toBe('A good headline');
    expect(publishButton).toBeEnabled();

    // Enter >30 chars, component should clamp to 30
    const long = 'x'.repeat(40);
    fireEvent.change(topicInput, { target: { value: long } });
    expect(topicInput.value.length).toBeLessThanOrEqual(30);
    expect(publishButton).toBeEnabled();
  });

  it('clamps sliders so total effort does not exceed maxTotal', () => {
    const onPublish = vi.fn();
    const onClose = vi.fn();
    // Set maxTotal small to test clamping easily
    render(<PublishPanel onPublish={onPublish} onClose={onClose} maxTotal={200} />);

    const getRange = (labelFragment: string) =>
      screen.getByLabelText(new RegExp(labelFragment, 'i')) as HTMLInputElement;

    // Grab a couple of slider number inputs (they share accessible labels)
    const investAgg = getRange('Investigate — Aggregate');
    const investOrig = getRange('Investigate — Original');
    const investFc = getRange('Investigate — Fact-check');

    // Read current totals by summing all range inputs (there are 7)
    const allRanges = screen.getAllByRole('slider') as HTMLInputElement[];
    const numeric = () => allRanges.reduce((s, r) => s + Number(r.value), 0);

    const beforeTotal = numeric();
    // Try to set one slider to 100 so that total > maxTotal
    fireEvent.change(investAgg, { target: { value: '100' } });

    const afterTotal = numeric();
    expect(afterTotal).toBeLessThanOrEqual(200);
  });

  it('calls onPublish with the expected draft and closes panel', () => {
    const onPublish = vi.fn<[(draft: DraftArticle) => void]>();
    const onClose = vi.fn();
    render(<PublishPanel onPublish={onPublish} onClose={onClose} />);

    const topicInput = screen.getByPlaceholderText('Write a catchy headline...') as HTMLInputElement;
    const publishButton = screen.getByRole('button', { name: /publish/i }) as HTMLButtonElement;

    fireEvent.change(topicInput, { target: { value: 'Test Headline' } });

    // Click Publish
    fireEvent.click(publishButton);

    expect(onPublish).toHaveBeenCalledTimes(1);
    const arg = onPublish.mock.calls[0][0] as DraftArticle;
    expect(arg.topic).toBe('Test Headline');
    expect(typeof arg.type).toBe('string');
    expect(arg.qualities).toBeDefined();

    // Panel should close
    expect(onClose).toHaveBeenCalled();
  });
});
