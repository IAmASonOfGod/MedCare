"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MoreVertical, 
  Mail,
  MapPin,
  Phone,
  Building
} from "lucide-react";

interface Practice {
  $id: string;
  practiceName: string;
  practiceType: string;
  contactEmail: string;
  contactPhone: string;
  streetAddress: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  registrationNumber: string;
  practiceDescription?: string;
  website?: string;
  verificationStatus: "pending" | "verified" | "rejected";
  $createdAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

const PracticeVerificationPage = () => {
  const [practices, setPractices] = useState<Practice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchPractices = async (status?: string) => {
    try {
      setLoading(true);
      const url = status ? `/api/admin/practices?status=${status}` : "/api/admin/practices";
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Failed to fetch practices");
      }
      
      const data = await response.json();
      setPractices(data.practices || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationAction = async (practiceId: string, status: "verified" | "rejected") => {
    try {
      setActionLoading(practiceId);
      const response = await fetch(`/api/admin/practices/${practiceId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update verification status");
      }
      
      // Refresh the practices list
      await fetchPractices();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchPractices();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "verified":
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const pendingPractices = practices.filter(p => p.verificationStatus === "pending");
  const verifiedPractices = practices.filter(p => p.verificationStatus === "verified");
  const rejectedPractices = practices.filter(p => p.verificationStatus === "rejected");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => fetchPractices()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Practice Verification</h1>
        <p className="text-gray-600">Manage practice registrations and verification status</p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            Pending ({pendingPractices.length})
          </TabsTrigger>
          <TabsTrigger value="verified">
            Verified ({verifiedPractices.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedPractices.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingPractices.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No pending practices to review</p>
              </CardContent>
            </Card>
          ) : (
            pendingPractices.map((practice) => (
              <PracticeCard
                key={practice.$id}
                practice={practice}
                onVerify={() => handleVerificationAction(practice.$id, "verified")}
                onReject={() => handleVerificationAction(practice.$id, "rejected")}
                isLoading={actionLoading === practice.$id}
                showActions={true}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="verified" className="space-y-4">
          {verifiedPractices.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No verified practices</p>
              </CardContent>
            </Card>
          ) : (
            verifiedPractices.map((practice) => (
              <PracticeCard
                key={practice.$id}
                practice={practice}
                isLoading={false}
                showActions={false}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedPractices.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No rejected practices</p>
              </CardContent>
            </Card>
          ) : (
            rejectedPractices.map((practice) => (
              <PracticeCard
                key={practice.$id}
                practice={practice}
                isLoading={false}
                showActions={false}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface PracticeCardProps {
  practice: Practice;
  onVerify?: () => void;
  onReject?: () => void;
  isLoading: boolean;
  showActions: boolean;
}

const PracticeCard: React.FC<PracticeCardProps> = ({
  practice,
  onVerify,
  onReject,
  isLoading,
  showActions,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "verified":
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl font-semibold text-gray-900 mb-2">
              {practice.practiceName}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Building className="w-4 h-4" />
                <span className="capitalize">{practice.practiceType}</span>
              </div>
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <span>{practice.contactEmail}</span>
              </div>
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                <span>{practice.contactPhone}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(practice.verificationStatus)}
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" disabled={isLoading}>
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={onVerify}
                    disabled={isLoading}
                    className="text-green-600"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify & Send Invite
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={onReject}
                    disabled={isLoading}
                    className="text-red-600"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Practice Details</h4>
            <div className="space-y-1 text-gray-600">
              <p><span className="font-medium">Registration Number:</span> {practice.registrationNumber}</p>
              {practice.practiceDescription && (
                <p><span className="font-medium">Description:</span> {practice.practiceDescription}</p>
              )}
              {practice.website && (
                <p><span className="font-medium">Website:</span> <a href={practice.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{practice.website}</a></p>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Location</h4>
            <div className="flex items-start gap-1 text-gray-600">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p>{practice.streetAddress}</p>
                <p>{practice.suburb}, {practice.city}</p>
                <p>{practice.province} {practice.postalCode}</p>
                <p>{practice.country}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
          <p>Registered: {formatDate(practice.$createdAt)}</p>
          {practice.verifiedAt && (
            <p>Verified: {formatDate(practice.verifiedAt)}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PracticeVerificationPage;
