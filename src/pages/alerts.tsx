import ThreatSubscriptions from "@/components/alerts/threat-subscriptions";
import ComingSoonLayout from "@/components/templates/coming-soon";
import { Bell } from "lucide-react";

export default function AlertsPage() {
  // return (
  //   <div className="content-section">
  //     <div className="mb-8">
  //       <h1 className="text-3xl font-bold text-slate-900 mb-2">Alert Subscriptions</h1>
  //       <p className="text-slate-600">Configure your threat detection and notification preferences</p>
  //     </div>

  //     <ThreatSubscriptions />
  //   </div>
  // );
  return (
    <ComingSoonLayout item={{
      icon: Bell,
      title: "Alert Subscriptions",
      description: "Configure your threat detection and notification preferences",
      color: "red",
      comingSoonTitle: "Alert Subscriptions Coming Soon",
      scope: "Configure your notification preferences for different threat detections"
    }}/>
  );
}
