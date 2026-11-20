"use client";

import React, { useState, useEffect } from "react";
import { Bike, Clock, MapPin, ChevronDown, Check } from "lucide-react";

const DELIVERY_ZONES = [
  { area: "Brooklyn Heights, NY", eta: "25–35 mins", zone: "Brooklyn" },
  { area: "Downtown Manhattan, NY", eta: "20–30 mins", zone: "Downtown" },
  { area: "Williamsburg, Brooklyn, NY", eta: "25–35 mins", zone: "Brooklyn" },
  { area: "Little Italy, Manhattan, NY", eta: "18–28 mins", zone: "Little Italy" },
  { area: "Midtown Queens, NY", eta: "30–40 mins", zone: "Queens" },
];

export default function DeliveryBar() {
  const [selectedZone, setSelectedZone] = useState(DELIVERY_ZONES[0]);
  const [isOpen, setIsOpen] = useState(false);
  const [customAddress, setCustomAddress] = useState("");

  // Load saved location on mount
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
      {/* Interactive Delivery Bar */}
      <div className="bg-[#FFF4E5] border border-[#FDE2C4] px-4 py-2.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-[#7A4100] shadow-xs transition hover:border-[#D97706]/50">
        
        {/* Clickable Location Selector */}
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

        {/* Dynamic Estimated Delivery Time Pill */}
        <div className="flex items-center gap-1.5 font-bold bg-white px-3 py-1 rounded-full text-[11px] shadow-xs border border-[#FDE2C4] text-[#190F0E]">
          <Clock className="w-3 h-3 text-[#D97706]" />
          <span>{selectedZone.eta}</span>
        </div>
      </div>

      {/* Dropdown Popover to Change Delivery Location */}
      {isOpen && (
        <>
          {/* Backdrop overlay */}
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

            {/* Popular Area Options */}
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

            {/* Custom Street Address Input */}
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
                  className="px-3.5 py-1.5 bg-[#8E1616] text-white rounded-xl font-bold text-xs hover:bg-[#751111] transition shadow-xs"
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
