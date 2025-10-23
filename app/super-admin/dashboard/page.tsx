"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSuperAdminInvites } from "@/lib/actions/superAdmin.actions";
import { fetchPractices } from "@/lib/actions/practice.actions";

interface Practice {
  $id: string;
  practiceName: string;
  email: string;
  phone: string;
  address: string;
  isVerified: boolean;
  createdAt: string;
}

interface SuperAdminInvite {
  $id: string;
  practiceId: string;
  practiceName: string;
  email: string;
  status: "pending" | "sent" | "used" | "expired";
  createdAt: string;
  expiresAt: string;
  usedAt?: string;
}

export default function SuperAdminDashboard() {
  const [practices, setPractices] = useState<Practice[]>([]);
  const [invites, setInvites] = useState<SuperAdminInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateInviteOpen, setIsCreateInviteOpen] = useState(false);
  const [newInvite, setNewInvite] = useState({
    practiceId: "",
    practiceName: "",
    email: "",
    phone: "",
    ttlHours: 72,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/super-admin/dashboard");
      if (response.ok) {
        const data = await response.json();
        setPractices(data.practices);
        setInvites(data.invites);
      } else {
        console.error("Failed to fetch dashboard data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInvite = async () => {
    try {
      const response = await fetch("/api/super-admin/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInvite),
      });

      if (response.ok) {
        setIsCreateInviteOpen(false);
        setNewInvite({ practiceId: "", practiceName: "", email: "", phone: "", ttlHours: 72 });
        fetchData(); // Refresh data
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error creating invite:", error);
      alert("Failed to create invite");
    }
  };

  const handleVerifyPractice = async (practiceId: string) => {
    try {
      const response = await fetch(`/api/super-admin/practices/${practiceId}/verify`, {
        method: "POST",
      });

      if (response.ok) {
        fetchData(); // Refresh data
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error verifying practice:", error);
      alert("Failed to verify practice");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500";
      case "sent": return "bg-blue-500";
      case "used": return "bg-green-500";
      case "expired": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Super Admin Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Super Admin Dashboard</h1>
          <p className="text-gray-400">Manage practices and admin invites</p>
        </header>

        {/* Practice Verification Section */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Practice Verification</h2>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white border border-gray-600">
              {practices.filter(p => !p.isVerified).length} Pending
            </span>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-white">Practice Name</TableHead>
                  <TableHead className="text-white">Email</TableHead>
                  <TableHead className="text-white">Phone</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Created</TableHead>
                  <TableHead className="text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {practices.map((practice) => (
                  <TableRow key={practice.$id} className="border-gray-700">
                    <TableCell className="text-white">{practice.practiceName}</TableCell>
                    <TableCell className="text-white">{practice.email}</TableCell>
                    <TableCell className="text-white">{practice.phone}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${practice.isVerified ? "bg-green-500" : "bg-yellow-500"}`}>
                        {practice.isVerified ? "Verified" : "Pending"}
                      </span>
                    </TableCell>
                    <TableCell className="text-white">
                      {new Date(practice.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {!practice.isVerified && (
                        <Button
                          onClick={() => handleVerifyPractice(practice.$id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Verify
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* Admin Invites Section */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Admin Invites</h2>
            <Dialog open={isCreateInviteOpen} onOpenChange={setIsCreateInviteOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Create Invite
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700 text-white">
                <DialogHeader>
                  <DialogTitle className="text-white">Create Admin Invite</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="practiceId" className="text-white">Practice ID</Label>
                    <Input
                      id="practiceId"
                      value={newInvite.practiceId}
                      onChange={(e) => setNewInvite({ ...newInvite, practiceId: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="practiceName" className="text-white">Practice Name</Label>
                    <Input
                      id="practiceName"
                      value={newInvite.practiceName}
                      onChange={(e) => setNewInvite({ ...newInvite, practiceName: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-white">Admin Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newInvite.email}
                      onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-white">Phone Number (Optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+27828156478"
                      value={newInvite.phone}
                      onChange={(e) => setNewInvite({ ...newInvite, phone: e.target.value })}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <p className="text-gray-400 text-xs mt-1">Format: +27[area code][local number] (no leading 0)</p>
                  </div>
                  <div>
                    <Label htmlFor="ttlHours" className="text-white">Expiry (hours)</Label>
                    <Input
                      id="ttlHours"
                      type="number"
                      value={newInvite.ttlHours}
                      onChange={(e) => setNewInvite({ ...newInvite, ttlHours: parseInt(e.target.value) })}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateInviteOpen(false)}
                      className="border-gray-600 text-white hover:bg-gray-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateInvite}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Create Invite
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-white">Practice</TableHead>
                  <TableHead className="text-white">Email</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Created</TableHead>
                  <TableHead className="text-white">Expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invites.map((invite) => (
                  <TableRow key={invite.$id} className="border-gray-700">
                    <TableCell className="text-white">{invite.practiceName}</TableCell>
                    <TableCell className="text-white">{invite.email}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(invite.status)}`}>
                        {invite.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-white">
                      {new Date(invite.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-white">
                      {new Date(invite.expiresAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
    </div>
  );
}
