"use client";

import React, { useState, useEffect } from "react";
import { Bike, ChevronDown, Clock, MapPin, Check } from "lucide-react";

export const DELIVERY_ZONES = [
  { area: "Little Italy, Manhattan, NY", eta: "15–25 mins", zone: "Downtown" },
  { area: "Williamsburg, Brooklyn, NY", eta: "20–30 mins", zone: "Brooklyn" },
  { area: "North Beach, San Francisco, CA", eta: "20–30 mins", zone: "North Beach" },
  { area: "Greenwich Village, Manhattan, NY", eta: "15–25 mins", zone: "Village" },
  { area: "DUMBO, Brooklyn, NY", eta: "25–35 mins", zone: "Waterfront" },
];

export default function DeliveryBar() {
  const [selectedZone, setSelectedZone] = useState(DELIVERY_ZONES[0]);
  const [isOpen, setIsOpen] = useState(false);
  const [customAddress, setCustomAddress] = useState("");

  useEffect(() => {
    const savedArea = localStorage.getItem("pizzahub_delivery_area");
    const savedEta = localStorage.getItem("pizzahub_delivery_eta");
    if (savedArea && savedEta) {
      setSelectedZone({
        area: savedArea,
        eta: savedEta,
        zone: savedArea.split(",")[0],
      });
    }
  }, []);

  const handleSelectZone = (zone: typeof DELIVERY_ZONES[0]) => {
    setSelectedZone(zone);
    setIsOpen(false);
    localStorage.setItem("pizzahub_delivery_area", zone.area);
    localStorage.setItem("pizzahub_delivery_eta", zone.eta);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customAddress.trim()) {
      const customZone = {
        area: customAddress.trim(),
        eta: "25–35 mins",
        zone: customAddress.trim(),
      };
      setSelectedZone(customZone);
      setIsOpen(false);
      localStorage.setItem("pizzahub_delivery_area", customZone.area);
      localStorage.setItem("pizzahub_delivery_eta", customZone.eta);
      setCustomAddress("");
    }
  };

  return (
    <div className="relative">
      <div className="bg-[#FFF4E5] border border-[#FDE2C4] px-4 py-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-[#7A4100] shadow-xs transition hover:border-[#D97706]/50">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 group cursor-pointer text-left focus:outline-none"
          title="Click to change delivery location"
        >
          <div className="w-6 h-6 rounded-lg bg-white border border-[#FDE2C4] flex items-center justify-center shrink-0">
            <Bike className="w-3.5 h-3.5 text-[#D97706]" />
          </div>
          <div>
            <span className="text-[10px] text-[#A15500] font-bold uppercase tracking-wider block">
              Deliver to
            </span>
            <span className="font-extrabold text-[#190F0E] group-hover:text-[#8E1616] transition flex items-center gap-1">
              <span>{selectedZone.area}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </span>
          </div>
        </button>

        <div className="flex items-center gap-1.5 font-bold bg-white px-3 py-1 rounded-full text-[11px] shadow-xs border border-[#FDE2C4] text-[#190F0E]">
          <Clock className="w-3.5 h-3.5 text-[#D97706]" />
          <span>{selectedZone.eta}</span>
        </div>
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute top-full left-0 mt-2 z-50 w-full sm:w-96 bg-white rounded-2xl border border-[#EFE7DE] shadow-xl p-4 space-y-3 text-xs animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between pb-2 border-b border-[#EFE7DE]">
              <span className="font-extrabold text-sm text-[#190F0E] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#8E1616]" />
                <span>Select Delivery Area</span>
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                Popular Verified Kitchen Zones
              </span>
              {DELIVERY_ZONES.map((zoneItem) => (
                <button
                  key={zoneItem.area}
                  type="button"
                  onClick={() => handleSelectZone(zoneItem)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition ${
                    selectedZone.area === zoneItem.area
                      ? "bg-[#FFF4E5] text-[#8E1616] font-bold border border-[#FDE2C4]"
                      : "hover:bg-[#FAF7F2] text-[#190F0E]"
                  }`}
                >
                  <div>
                    <span className="block font-semibold">{zoneItem.area}</span>
                    <span className="text-[10px] text-gray-500">Avg. Oven Dispatch: {zoneItem.eta}</span>
                  </div>
                  {selectedZone.area === zoneItem.area && (
                    <Check className="w-4 h-4 text-[#8E1616]" />
                  )}
                </button>
              ))}
            </div>

            <form onSubmit={handleCustomSubmit} className="pt-2 border-t border-[#EFE7DE] space-y-2">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                Or Type Custom Street Address
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  placeholder="e.g. Flat 3B, 450 Broadway, NY"
                  className="flex-1 px-3 py-1.5 rounded-xl border border-[#EFE7DE] bg-[#FAF7F2] text-xs outline-none focus:border-[#8E1616]"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-[#8E1616] text-white text-xs font-bold rounded-xl hover:bg-[#721111] transition shadow-xs"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
