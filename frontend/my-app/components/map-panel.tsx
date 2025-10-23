"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { MapPin, Calendar, ZoomIn, ZoomOut } from "lucide-react"

type MapData = {
  vegetation: Array<{ x: number; y: number; r: number; label: string }>;
  water: Array<{ x: number; y: number; rx: number; ry: number; label: string; type: string }>;
  heat: Array<{ x: number; y: number; r: number; label: string }>;
  encroachment: Array<{ x: number; y: number; width: number; height: number; label: string }>;
};

export default function MapPanel() {
  const [layers, setLayers] = useState({
    vegetation: true,
    water: true,
    heat: true,
    encroachment: false,
  })

  const [zoom, setZoom] = useState(1)
  const [city, setCity] = useState<string | null>(null)
  const [mapData, setMapData] = useState<MapData | null>(null)
  const [loading, setLoading] = useState(true)

  // City-specific map configurations
  const CITY_CONFIGS = {
    Bengaluru: {
      baseGradient: 'linear-gradient(135deg, #6d8a5e 0%, #7a9468 25%, #8fa87a 50%, #5f7850 75%, #6d8a5e 100%)',
      roads: [
        { x: 50, y: 150, width: 200, height: 4, angle: 0 },
        { x: 300, y: 100, width: 250, height: 4, angle: 0 },
        { x: 100, y: 280, width: 150, height: 4, angle: 0 },
        { x: 200, y: 0, width: 4, height: 250, angle: 90 },
        { x: 400, y: 80, width: 4, height: 300, angle: 90 },
      ],
      urbanBlocks: [
        { x: 70, y: 170, width: 45, height: 45 },
        { x: 130, y: 165, width: 40, height: 40 },
        { x: 320, y: 120, width: 55, height: 50 },
        { x: 410, y: 130, width: 48, height: 45 },
        { x: 250, y: 300, width: 42, height: 38 },
      ]
    },
    Gurugram: {
      baseGradient: 'linear-gradient(135deg, #9a9580 0%, #8a8670 25%, #a5a090 50%, #7d7d68 75%, #9a9580 100%)',
      roads: [
        { x: 100, y: 120, width: 180, height: 4, angle: 0 },
        { x: 320, y: 180, width: 220, height: 4, angle: 0 },
        { x: 80, y: 260, width: 140, height: 4, angle: 0 },
        { x: 150, y: 50, width: 4, height: 200, angle: 90 },
        { x: 380, y: 120, width: 4, height: 250, angle: 90 },
        { x: 480, y: 80, width: 4, height: 280, angle: 90 },
      ],
      urbanBlocks: [
        { x: 110, y: 140, width: 50, height: 50 },
        { x: 180, y: 135, width: 45, height: 45 },
        { x: 330, y: 200, width: 60, height: 55 },
        { x: 420, y: 195, width: 52, height: 50 },
        { x: 490, y: 210, width: 48, height: 45 },
        { x: 160, y: 280, width: 45, height: 40 },
      ]
    }
  }

  useEffect(() => {
    const storedCity = localStorage.getItem("selectedCity");
    if (storedCity) {
      try {
        const parsed = JSON.parse(storedCity);
        setCity(parsed.name || parsed);
      } catch {
        setCity(storedCity);
      }
    }
  }, []);

  useEffect(() => {
    async function fetchMapData() {
      if (!city) return;
      
      try {
        setLoading(true);
        const cityParam = `?city=${encodeURIComponent(city)}`;
        const res = await fetch(`http://localhost:5555/api/map${cityParam}`);
        const data = await res.json();
        
        // City-specific default data
        const cityDefaults = city === "Bengaluru" ? {
          vegetation: [
            { x: 140, y: 90, r: 40, label: "Cubbon Park" },
            { x: 450, y: 140, r: 45, label: "Lalbagh" },
            { x: 200, y: 310, r: 35, label: "Green Belt" }
          ],
          water: [
            { x: 320, y: 150, rx: 50, ry: 40, label: "Ulsoor Lake", type: "ellipse" },
            { x: 180, y: 250, rx: 38, ry: 30, label: "Sankey Tank", type: "ellipse" },
            { x: 520, y: 280, rx: 32, ry: 26, label: "Hebbal Lake", type: "ellipse" }
          ],
          heat: [
            { x: 110, y: 260, r: 30, label: "CBD" },
            { x: 400, y: 110, r: 28, label: "Airport" },
            { x: 280, y: 60, r: 25, label: "Industrial" }
          ],
          encroachment: [
            { x: 80, y: 175, width: 48, height: 48, label: "Encr." },
            { x: 500, y: 330, width: 55, height: 42, label: "Encr." }
          ]
        } : {
          vegetation: [
            { x: 130, y: 70, r: 32, label: "Biodiv Park" },
            { x: 460, y: 110, r: 38, label: "Aravalli" },
            { x: 190, y: 290, r: 28, label: "Green" }
          ],
          water: [
            { x: 420, y: 220, rx: 48, ry: 38, label: "Damdama", type: "ellipse" },
            { x: 150, y: 180, rx: 30, ry: 24, label: "Basai", type: "rect" }
          ],
          heat: [
            { x: 120, y: 240, r: 32, label: "Cyber City" },
            { x: 430, y: 95, r: 30, label: "MG Road" },
            { x: 310, y: 55, r: 26, label: "Sector 29" }
          ],
          encroachment: [
            { x: 75, y: 165, width: 52, height: 52, label: "Encr." },
            { x: 515, y: 325, width: 58, height: 48, label: "Encr." }
          ]
        };

        setMapData({
          vegetation: data.vegetation || cityDefaults.vegetation,
          water: data.water || cityDefaults.water,
          heat: data.heat || cityDefaults.heat,
          encroachment: data.encroachment || cityDefaults.encroachment
        });
      } catch (err) {
        console.error("Failed to fetch map data:", err);
        
        // City-specific default data for error fallback
        const cityDefaults = city === "Bengaluru" ? {
          vegetation: [
            { x: 140, y: 90, r: 40, label: "Cubbon Park" },
            { x: 450, y: 140, r: 45, label: "Lalbagh" },
            { x: 200, y: 310, r: 35, label: "Green Belt" }
          ],
          water: [
            { x: 370, y: 190, rx: 55, ry: 45, label: "Ulsoor Lake", type: "ellipse" },
            { x: 480, y: 300, rx: 35, ry: 28, label: "Sankey Tank", type: "ellipse" }
          ],
          heat: [
            { x: 110, y: 260, r: 30, label: "CBD" },
            { x: 400, y: 110, r: 28, label: "Airport" },
            { x: 280, y: 60, r: 25, label: "Industrial" }
          ],
          encroachment: [
            { x: 80, y: 175, width: 48, height: 48, label: "Encr." },
            { x: 500, y: 330, width: 55, height: 42, label: "Encr." }
          ]
        } : {
          vegetation: [
            { x: 130, y: 70, r: 32, label: "Biodiv Park" },
            { x: 460, y: 110, r: 38, label: "Aravalli" },
            { x: 190, y: 290, r: 28, label: "Green" }
          ],
          water: [
            { x: 340, y: 170, rx: 45, ry: 35, label: "Damdama", type: "ellipse" },
            { x: 510, y: 310, rx: 28, ry: 22, label: "Pond", type: "rect" }
          ],
          heat: [
            { x: 120, y: 240, r: 32, label: "Cyber City" },
            { x: 430, y: 95, r: 30, label: "MG Road" },
            { x: 310, y: 55, r: 26, label: "Sector 29" }
          ],
          encroachment: [
            { x: 75, y: 165, width: 52, height: 52, label: "Encr." },
            { x: 515, y: 325, width: 58, height: 48, label: "Encr." }
          ]
        };

        setMapData(cityDefaults);
      } finally {
        setLoading(false);
      }
    }

    fetchMapData();
  }, [city]);

  const toggleLayer = (layer: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }))
  }

  const handleZoom = (direction: "in" | "out") => {
    setZoom((prev) => (direction === "in" ? Math.min(prev + 0.2, 2) : Math.max(prev - 0.2, 0.8)))
  }

  return (
    <div className="h-full flex flex-col bg-secondary/50">
      {/* Map Header */}
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold mb-4">Interactive Map</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{city || "Loading..."}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full bg-slate-900">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Satellite Background - City-specific terrain */}
            <div 
              className="absolute inset-0"
              style={{
                background: city && CITY_CONFIGS[city as keyof typeof CITY_CONFIGS] 
                  ? CITY_CONFIGS[city as keyof typeof CITY_CONFIGS].baseGradient
                  : 'linear-gradient(135deg, #8b9d83 0%, #7a8a6f 25%, #9ba892 50%, #6d7d63 75%, #8b9d83 100%)',
                backgroundSize: '400% 400%',
                transform: `scale(${zoom})`,
                transformOrigin: "center",
                transition: "transform 0.3s ease"
              }}
            >
              {/* Add texture pattern for satellite look */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px),
                    repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)
                  `
                }}
              />
              {/* Roads/Urban areas - City specific */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 400">
                {city && CITY_CONFIGS[city as keyof typeof CITY_CONFIGS] && 
                  CITY_CONFIGS[city as keyof typeof CITY_CONFIGS].roads.map((road, idx) => (
                    <rect 
                      key={`road-${idx}`}
                      x={road.x} 
                      y={road.y} 
                      width={road.width} 
                      height={road.height} 
                      fill="#555" 
                      opacity="0.6" 
                    />
                  ))
                }
                
                {/* Urban blocks - City specific */}
                {city && CITY_CONFIGS[city as keyof typeof CITY_CONFIGS] && 
                  CITY_CONFIGS[city as keyof typeof CITY_CONFIGS].urbanBlocks.map((block, idx) => (
                    <rect 
                      key={`block-${idx}`}
                      x={block.x} 
                      y={block.y} 
                      width={block.width} 
                      height={block.height} 
                      fill="#666" 
                      opacity="0.4" 
                    />
                  ))
                }
              </svg>
            </div>
            
            {/* SVG Overlay for data layers */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 600 400"
              preserveAspectRatio="xMidYMid slice"
              style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
            >
              {/* Vegetation areas (green parks) */}
              {layers.vegetation && mapData?.vegetation && mapData.vegetation.map((veg, idx) => (
                <g key={`veg-${idx}`}>
                  <circle cx={veg.x} cy={veg.y} r={veg.r} fill="#22c55e" opacity="0.7" />
                  <text x={veg.x} y={veg.y + 5} textAnchor="middle" fontSize="10" fill="#fff" fontWeight="bold">
                    {veg.label}
                  </text>
                </g>
              ))}

              {/* Water bodies (blue) */}
              {layers.water && mapData?.water && mapData.water.map((water, idx) => (
                <g key={`water-${idx}`}>
                  {water.type === 'ellipse' ? (
                    <ellipse cx={water.x} cy={water.y} rx={water.rx} ry={water.ry} fill="#3b82f6" opacity="0.7" />
                  ) : (
                    <rect x={water.x} y={water.y} width={water.rx * 2} height={water.ry * 2} fill="#3b82f6" opacity="0.7" rx="5" />
                  )}
                  <text x={water.x} y={water.y + 5} textAnchor="middle" fontSize="10" fill="#fff" fontWeight="bold">
                    {water.label}
                  </text>
                </g>
              ))}

              {/* Heat hotspots (red) */}
              {layers.heat && mapData?.heat && mapData.heat.map((heat, idx) => (
                <g key={`heat-${idx}`}>
                  <circle cx={heat.x} cy={heat.y} r={heat.r} fill="#ef4444" opacity="0.7" />
                  <text x={heat.x} y={heat.y + 5} textAnchor="middle" fontSize="9" fill="#fff" fontWeight="bold">
                    {heat.label}
                  </text>
                </g>
              ))}

              {/* Encroachment areas (yellow) */}
              {layers.encroachment && mapData?.encroachment && mapData.encroachment.map((enc, idx) => (
                <g key={`enc-${idx}`}>
                  <rect x={enc.x} y={enc.y} width={enc.width} height={enc.height} fill="#eab308" opacity="0.7" rx="3" />
                  <text x={enc.x + enc.width / 2} y={enc.y + enc.height / 2 + 5} textAnchor="middle" fontSize="9" fill="#000" fontWeight="bold">
                    {enc.label}
                  </text>
                </g>
              ))}

              {/* City center marker */}
              <circle cx="300" cy="200" r="8" fill="#10b981" />
              <circle cx="300" cy="200" r="16" fill="none" stroke="#10b981" strokeWidth="2" opacity="0.7" />
              <circle cx="300" cy="200" r="24" fill="none" stroke="#10b981" strokeWidth="1" opacity="0.5" />
            </svg>
          </>
        )}

        {/* Zoom controls */}
        <div className="absolute bottom-4 right-4 flex gap-2 z-10">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleZoom("in")}
            className="bg-background/80 backdrop-blur"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleZoom("out")}
            className="bg-background/80 backdrop-blur"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Layer Controls */}
      <div className="p-6 border-t border-border space-y-4">
        <h3 className="font-semibold text-sm">Map Layers</h3>
        <div className="space-y-3">
          {[
            { id: "vegetation", label: "Vegetation (Green)", color: "bg-green-500" },
            { id: "water", label: "Water Bodies (Blue)", color: "bg-blue-500" },
            { id: "heat", label: "Heat Hotspots (Red)", color: "bg-red-500" },
            { id: "encroachment", label: "Encroachment (Yellow)", color: "bg-yellow-500" },
          ].map((layer) => (
            <div key={layer.id} className="flex items-center gap-3">
              <Checkbox
                checked={layers[layer.id as keyof typeof layers]}
                onCheckedChange={() => toggleLayer(layer.id as keyof typeof layers)}
              />
              <div className="flex items-center gap-2 flex-1">
                <div className={`w-3 h-3 rounded-full ${layer.color}`} />
                <span className="text-sm">{layer.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}