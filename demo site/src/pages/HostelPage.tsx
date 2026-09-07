import React, { useState } from 'react'
import {
  Bus,
  Phone,
  Building,
} from 'lucide-react'
import { useErpData } from '../context/ErpDataContext'
import { Badge } from '../components/common/Badge'

export const HostelPage: React.FC = () => {
  const { busRoutes, hostelRooms } = useErpData()
  const [activeTab, setActiveTab] = useState<'transport' | 'boarding'>('transport')

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7e948c]">
            GREENWOOD STUDENT LOGISTICS
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-normal text-[#14241e] tracking-tight">
            Transport & Boarding Facilities
          </h1>
          <p className="text-sm text-[#50685e]">
            School bus fleet tracking, designated pickup/drop stops, driver contacts, and campus boarding wings.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-[#f4f8f5] p-1 border border-[#d6e3dc]">
          <button
            onClick={() => setActiveTab('transport')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'transport'
                ? 'bg-[#0e4b38] text-white shadow-xs'
                : 'text-[#485c54] hover:text-[#0e4b38]'
            }`}
          >
            <Bus className="h-4 w-4" />
            <span>School Bus Routes</span>
          </button>
          <button
            onClick={() => setActiveTab('boarding')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === 'boarding'
                ? 'bg-[#0e4b38] text-white shadow-xs'
                : 'text-[#485c54] hover:text-[#0e4b38]'
            }`}
          >
            <Building className="h-4 w-4" />
            <span>Boarding Dorms</span>
          </button>
        </div>
      </div>

      {activeTab === 'transport' ? (
        /* BUS ROUTES LIST */
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {busRoutes.map((route) => (
            <div
              key={route.id}
              className="flex flex-col justify-between rounded-2xl border border-[#e2ece6] bg-white p-6 shadow-bluke-sm hover:border-[#cde0d5] transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#0e4b38]">{route.routeNumber}</span>
                    <h3 className="font-editorial text-lg font-semibold text-[#14241e]">
                      Bus #{route.busNumber}
                    </h3>
                  </div>
                  <Badge variant="green" size="sm">
                    {route.status}
                  </Badge>
                </div>

                <div className="space-y-1.5 rounded-xl bg-[#f8faf9] p-3 text-xs border border-[#edf3ef]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#71877e]">Driver:</span>
                    <span className="font-semibold text-[#14241e]">{route.driverName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#71877e]">Contact:</span>
                    <span className="font-mono text-[#0e4b38] flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {route.driverPhone}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#71877e]">Attendant:</span>
                    <span className="text-[#14241e]">{route.attendantName}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-[#71877e] uppercase">
                    Route Stoppages & Timings:
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {route.stops.map((stop, idx) => (
                      <div key={stop} className="flex items-center gap-2 text-[#485c54]">
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#eaf4ee] text-[10px] font-bold text-[#0e4b38]">
                          {idx + 1}
                        </span>
                        <span className="truncate">{stop}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-[#edf3ef] pt-3 text-xs flex justify-between items-center text-[#71877e]">
                <span>Occupancy</span>
                <span className="font-semibold text-[#0e4b38]">
                  {route.occupied} / {route.capacity} seats filled
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* BOARDING DORMS LIST */
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {hostelRooms.map((room) => (
            <div
              key={room.id}
              className="rounded-2xl border border-[#e2ece6] bg-white p-6 shadow-bluke-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0e4b38]">{room.block}</span>
                <Badge variant={room.status === 'Available' ? 'green' : 'neutral'} size="sm">
                  {room.status}
                </Badge>
              </div>

              <div>
                <h3 className="font-editorial text-xl font-bold text-[#14241e]">
                  {room.roomNumber}
                </h3>
                <div className="text-xs text-[#71877e] mt-0.5">Warden: {room.warden}</div>
              </div>

              <div className="space-y-1 text-xs border-t border-[#edf3ef] pt-3">
                <span className="font-semibold text-[#14241e]">Boarding Pupils:</span>
                {room.students.map((st) => (
                  <div key={st.roll} className="flex justify-between text-[#50685e] py-0.5">
                    <span>{st.name} ({st.classGrade})</span>
                    <span className="font-mono">{st.roll}</span>
                  </div>
                ))}
              </div>

              <div className="text-xs text-[#71877e] pt-2 border-t border-[#edf3ef] flex justify-between">
                <span>Occupancy</span>
                <span className="font-semibold text-[#0e4b38]">{room.occupied} / {room.capacity} beds</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
