# Amazon SES Setup Guide for MedCare

This guide will walk you through setting up Amazon SES (Simple Email Service) for your MedCare application.

## Prerequisites

1. AWS Account
2. Domain name (for sending emails)
3. Access to AWS Console

## Step 1: AWS SES Setup

### 1.1 Create SES Configuration Set (Optional but Recommended)

1. Go to AWS SES Console
2. Navigate to "Configuration sets" → "Create configuration set"
3. Name: `medcare-email-config`
4. Add event destinations for tracking:
   - Bounces
   - Complaints
   - Deliveries
   - Opens
   - Clicks

### 1.2 Verify Your Domain

1. In SES Console, go to "Verified identities"
2. Click "Create identity"
3. Choose "Domain"
4. Enter your domain (e.g., `yourdomain.com`)
5. Check "Generate DKIM settings"
6. Add the provided DNS records to your domain

### 1.3 Verify Email Addresses (Development)

For development/testing, verify individual email addresses:
1. Click "Create identity" → "Email address"
2. Enter email (e.g., `no-reply@yourdomain.com`)
3. Check your email and click the verification link

### 1.4 Request Production Access

By default, SES is in sandbox mode (limited to verified addresses):
1. Go to "Account dashboard"
2. Click "Request production access"
3. Fill out the form explaining your use case
4. Wait for approval (usually 24-48 hours)

## Step 2: Create IAM User

### 2.1 Create IAM Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail",
        "ses:GetSendQuota",
        "ses:GetSendStatistics"
      ],
      "Resource": "*"
    }
  ]
}
```

### 2.2 Create IAM User

1. Go to IAM Console
2. Create new user: `medcare-ses-user`
3. Attach the policy above
4. Create access keys
5. Save the Access Key ID and Secret Access Key

## Step 3: Environment Configuration

### 3.1 Update Your .env File

```bash
# Email Service Configuration
EMAIL_SERVICE=ses

# Amazon SES Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
SES_FROM_EMAIL=no-reply@yourdomain.com
SES_CONFIGURATION_SET_NAME=medcare-email-config

# Keep Resend for fallback (optional)
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=no-reply@yourdomain.com
```

### 3.2 Environment Variables Explained

- `EMAIL_SERVICE`: Set to `ses` to use Amazon SES
- `AWS_REGION`: Your SES region (e.g., `us-east-1`, `eu-west-1`)
- `AWS_ACCESS_KEY_ID`: IAM user access key
- `AWS_SECRET_ACCESS_KEY`: IAM user secret key
- `SES_FROM_EMAIL`: Verified sender email address
- `SES_CONFIGURATION_SET_NAME`: Your SES configuration set name

## Step 4: Test Your Setup

### 4.1 Test API Endpoint

Use the test endpoint to verify your configuration:

```bash
curl -X POST http://localhost:3000/api/test-ses \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 4.2 Check Console Logs

Look for success messages:
```
Email sent successfully: 0000018b7c9c5f9e-12345678-1234-1234-1234-123456789012
```

## Step 5: Monitor and Troubleshoot

### 5.1 SES Console Monitoring

- **Sending statistics**: Track email delivery rates
- **Reputation metrics**: Monitor bounce and complaint rates
- **Account dashboard**: Check sending limits and status

### 5.2 Common Issues

#### Authentication Errors
- Verify AWS credentials are correct
- Check IAM policy permissions
- Ensure region matches your SES setup

#### Domain Verification Issues
- DNS records not propagated (wait 24-48 hours)
- Incorrect DNS record values
- Domain not fully verified

#### Sandbox Limitations
- Can only send to verified addresses
- Request production access for full functionality

## Step 6: Production Considerations

### 6.1 Email Templates

The application includes professional email templates:
- Admin invites
- Password resets
- Appointment confirmations
- Welcome emails

### 6.2 Bounce and Complaint Handling

SES automatically handles:
- Hard bounces (invalid emails)
- Soft bounces (temporary failures)
- Complaints (spam reports)

### 6.3 Sending Limits

- **Sandbox**: 200 emails/day, 1 email/second
- **Production**: 50,000 emails/day, 14 emails/second (default)
- Request limit increases as needed

## Step 7: Fallback Configuration

### 7.1 Switch Between Services

To switch back to Resend:
```bash
EMAIL_SERVICE=resend
```

### 7.2 Hybrid Setup

You can maintain both services and switch as needed:
```bash
# Use SES for production
EMAIL_SERVICE=ses

# Use Resend for development
EMAIL_SERVICE=resend
```

## Step 8: Security Best Practices

### 8.1 IAM Permissions

- Use least privilege principle
- Rotate access keys regularly
- Monitor IAM user activity

### 8.2 Environment Variables

- Never commit `.env` files to version control
- Use different credentials for dev/staging/prod
- Consider using AWS Secrets Manager for production

### 8.3 Email Content

- Avoid spam trigger words
- Include unsubscribe links
- Monitor reputation metrics

## Support and Resources

- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)
- [SES Best Practices](https://docs.aws.amazon.com/ses/latest/dg/best-practices.html)
- [SES Sending Limits](https://docs.aws.amazon.com/ses/latest/dg/manage-sending-quotas.html)

## Troubleshooting Checklist

- [ ] AWS credentials are correct
- [ ] Domain is verified in SES
- [ ] IAM user has proper permissions
- [ ] Region matches SES setup
- [ ] Environment variables are set
- [ ] Test endpoint returns success
- [ ] Emails are received
- [ ] No authentication errors in logs

If you encounter issues, check the console logs and AWS CloudTrail for detailed error information.

