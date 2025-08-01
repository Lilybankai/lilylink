# Page snapshot

```yaml
- heading "Welcome back" [level=1]
- paragraph: Sign in to your Lilylink account
- text: Email address
- textbox "Email address"
- text: Password
- textbox "Password"
- button
- button "Sign in"
- link "Forgot your password?":
  - /url: /auth/forgot-password
- text: Don't have an account?
- link "Sign up":
  - /url: /auth/register
- paragraph:
  - text: By signing in, you agree to our
  - link "Terms of Service":
    - /url: /terms
  - text: and
  - link "Privacy Policy":
    - /url: /privacy
- alert
```