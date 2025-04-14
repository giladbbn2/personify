export interface AnthropicClaudeResponse {
  content: [AnthropicClaudeResponseContentItem];
  stop_reason?: string | undefined;
}

export interface AnthropicClaudeResponseContentItem {
  text?: string | undefined;
  image?: string | undefined;
}
