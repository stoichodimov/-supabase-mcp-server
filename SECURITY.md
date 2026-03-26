# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Reporting a Vulnerability

**Please do not file a public issue for security vulnerabilities.**

Instead, please email security details to the project maintainers. We will acknowledge receipt of your report within 48 hours, and will send a more detailed response within 48 hours indicating the next steps in handling your report.

## Security Considerations

### Authentication

- Always use HTTPS in production
- Keep your `.env` file secure and never commit it
- Rotate your Supabase keys regularly
- JWT tokens should be treated as sensitive information

### Database

- Ensure RLS policies are enabled on all user-scoped tables
- Regularly audit RLS policies
- Use strong passwords for Supabase
- Enable 2FA on your Supabase account

### Client

- Sanitize all user inputs
- Use the provided `escapeHtml()` function for HTML content
- Keep dependencies updated
- Monitor for XSS vulnerabilities

## Best Practices

1. **Keep Dependencies Updated**: Regularly run `npm audit` and update packages
2. **Use HTTPS Only**: Never transmit data over unencrypted connections
3. **Secure Environment Variables**: Never log or expose sensitive data
4. **Validate Inputs**: Always validate user input on both client and server
5. **Test Security**: Include security tests in your test suite

## Disclosure Timeline

- Day 0: Vulnerability is disclosed to us
- Day 1: We acknowledge receipt
- Day 7: We provide initial assessment
- Day 14: We release a fix or timeline

Thank you for helping keep this project secure!
