'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function TestSESPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const handleTestEmail = async () => {
    if (!email) return;
    
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/test-ses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          details: data,
        });
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to send test email',
          details: data,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error occurred',
        details: error,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            SES Configuration Test
          </CardTitle>
          <CardDescription>
            Test your Amazon SES configuration by sending a test email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Test Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="test@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-sm text-gray-500">
              Enter an email address to send a test email via SES
            </p>
          </div>

          <Button 
            onClick={handleTestEmail} 
            disabled={!email || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Test Email...
              </>
            ) : (
              'Send Test Email'
            )}
          </Button>

          {result && (
            <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={result.success ? 'text-green-800' : 'text-red-800'}>
                <div className="font-medium">{result.message}</div>
                {result.details && (
                  <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">What this test does:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Validates your AWS credentials</li>
              <li>• Tests SES connectivity</li>
              <li>• Sends a test email via SES</li>
              <li>• Verifies email delivery</li>
            </ul>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Next Steps:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Check the recipient's inbox for the test email</li>
              <li>• Verify SES console shows successful delivery</li>
              <li>• Monitor your application logs for any errors</li>
              <li>• Test with different email addresses</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

