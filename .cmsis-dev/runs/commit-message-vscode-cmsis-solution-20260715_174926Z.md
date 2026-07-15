> Model: **cmsis-dev-openai-proxy/gpt-5.5**
> Metrics: 5.8s | 3,050 input tokens | 67 output tokens | 3,117 total tokens

# Trigger convert when used dbgconf files change

Watch dbgconf changes and resolve referenced dbgconf paths from cbuild files.
Only files used by the active solution trigger reloads, avoiding unnecessary
converts for unrelated debugger configs.