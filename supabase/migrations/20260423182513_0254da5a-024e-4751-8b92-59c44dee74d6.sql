-- RAG knowledge base for AI features
CREATE TABLE IF NOT EXISTS public.automotive_knowledge (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category text NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  keywords text[] NOT NULL DEFAULT '{}',
  symptoms text[] NOT NULL DEFAULT '{}',
  applies_to text[] NOT NULL DEFAULT '{}', -- e.g. {petrol, diesel, ev, all}
  source text NOT NULL DEFAULT 'AutoServe Expert Library',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_automotive_knowledge_keywords ON public.automotive_knowledge USING GIN (keywords);
CREATE INDEX IF NOT EXISTS idx_automotive_knowledge_symptoms ON public.automotive_knowledge USING GIN (symptoms);
CREATE INDEX IF NOT EXISTS idx_automotive_knowledge_category ON public.automotive_knowledge (category);

ALTER TABLE public.automotive_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "knowledge_select_all"
ON public.automotive_knowledge FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "knowledge_manage_manager"
ON public.automotive_knowledge FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'manager'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'manager'::app_role));

CREATE TRIGGER trg_knowledge_updated_at
BEFORE UPDATE ON public.automotive_knowledge
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Realtime
ALTER TABLE public.automotive_knowledge REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.automotive_knowledge;

-- Seed curated entries (Indian market focus)
INSERT INTO public.automotive_knowledge (category, title, body, keywords, symptoms, applies_to, source) VALUES
('brakes', 'Brake pad wear indicators', 'Most modern cars use a metal wear indicator that produces a high-pitched squeal when pads are worn to ~3mm. Continued use risks scoring the rotor (₹4,000–₹12,000 to machine or replace per axle). Indian stop-and-go traffic typically wears front pads in 30,000–45,000 km.', ARRAY['brake','pad','squeal','squeak','rotor','disc'], ARRAY['squealing when braking','squeaking sound','grinding noise','vibration in brake pedal'], ARRAY['all'], 'IS 11852 Brake Lining Standard'),
('brakes', 'Soft / spongy brake pedal', 'A pedal that travels too far before biting usually means air in the hydraulic line, a leaking caliper seal, or a failing master cylinder. Brake fluid is hygroscopic and should be flushed every 40,000 km or 2 years in Indian humidity.', ARRAY['brake','pedal','soft','spongy','fluid','hydraulic'], ARRAY['soft brake pedal','pedal goes to floor','low brake bite'], ARRAY['all'], 'SAE J1703 Fluid Specs'),
('engine', 'Engine knock / pinging', 'Knocking under acceleration often indicates low-octane fuel, carbon deposits on pistons, or worn knock sensor. Indian regular petrol is 91 RON — high-compression engines (Hyundai Venue Turbo, VW 1.0 TSI) require 95+. Persistent knock damages bearings.', ARRAY['knock','ping','detonation','octane','fuel'], ARRAY['knocking sound','pinging on acceleration','metallic ticking','rough idle'], ARRAY['petrol'], 'BIS IS 2796 Petrol Spec'),
('engine', 'Excessive white exhaust smoke', 'White smoke that smells sweet means coolant is entering combustion — likely a blown head gasket or cracked head (₹25,000–₹80,000 repair). Thin white vapour on cold start is normal condensation.', ARRAY['smoke','white','coolant','head','gasket'], ARRAY['white smoke from exhaust','sweet smell','coolant loss','overheating'], ARRAY['petrol','diesel'], 'AutoServe Engine Manual'),
('engine', 'Black exhaust smoke (diesel)', 'Black smoke = incomplete combustion, usually clogged air filter, faulty injectors, or DPF blockage. Common in Indian Tier-2 cities due to dust. Replacing air filter (₹400–₹1,200) often resolves it.', ARRAY['smoke','black','diesel','dpf','injector'], ARRAY['black smoke','loss of power','poor mileage','rough running'], ARRAY['diesel'], 'BS-VI Emission Guidelines'),
('engine', 'Engine overheating', 'Temperature gauge in red zone — stop immediately. Causes: low coolant, failed thermostat, clogged radiator (common in Delhi-NCR dust), or water pump failure. Continued driving warps the cylinder head (₹40,000+ repair).', ARRAY['overheat','temperature','coolant','radiator','thermostat'], ARRAY['temperature gauge high','steam from bonnet','coolant warning light'], ARRAY['petrol','diesel'], 'AutoServe Cooling Guide'),
('electrical', 'Battery wont hold charge', 'Indian summers (45°C+) reduce battery life to 2.5–3 years vs. 4–5 in temperate climates. If the car cranks slowly or dies overnight, get a load test done. Exide / Amaron 12V 35Ah replacements run ₹4,500–₹6,500.', ARRAY['battery','crank','dead','charge','start'], ARRAY['slow cranking','car wont start','clicking sound','dim headlights'], ARRAY['all'], 'IS 14257 Battery Standard'),
('electrical', 'Alternator failure signs', 'A whining noise, dim/flickering headlights at idle, or battery warning light during driving point to alternator failure. Test by measuring 13.8–14.4V at the battery with engine running. Rebuilds cost ₹3,500–₹8,000.', ARRAY['alternator','charging','whine','dim'], ARRAY['battery warning light','dim lights at idle','whining noise','electrical glitches'], ARRAY['all'], 'AutoServe Electrical Guide'),
('ac', 'AC not cooling properly', 'Most common cause in India is low refrigerant due to slow leak in O-rings or condenser pinholes from gravel impact. A regas with leak-test costs ₹2,000–₹3,500. Compressor failure (₹15,000–₹35,000) shows as engine RPM drop with AC on.', ARRAY['ac','cooling','refrigerant','gas','compressor'], ARRAY['weak cooling','warm air','clutch clicking','musty smell'], ARRAY['all'], 'AutoServe HVAC Library'),
('ac', 'Cabin filter and musty smell', 'Wet leaves and pollution clog the cabin filter every 10,000–15,000 km in Indian conditions, causing musty smell and poor airflow. Replacement is ₹400–₹1,000 and DIY-friendly on most cars.', ARRAY['cabin','filter','smell','musty','airflow'], ARRAY['musty smell','weak airflow','allergy symptoms','foggy windscreen'], ARRAY['all'], 'AutoServe HVAC Library'),
('tyres', 'Uneven tyre wear', 'Inner-edge wear = excessive negative camber or worn lower control arm. Outer-edge wear = under-inflation. Cupping/scalloping = worn shock absorbers. Rotate tyres every 8,000 km, align every 10,000 km in Indian road conditions.', ARRAY['tyre','tire','wear','alignment','camber','rotation'], ARRAY['uneven tyre wear','vibration at speed','pulling to one side','cupped tread'], ARRAY['all'], 'JATMA Tyre Care'),
('tyres', 'Tyre pressure for Indian roads', 'Most Indian sedans/hatchbacks: 30–33 psi front, 28–32 psi rear (cold). Add 2 psi for highway runs at 100+ kmph. Under-inflation reduces mileage by up to 10% and risks blowouts on hot tarmac.', ARRAY['pressure','psi','inflation','tyre'], ARRAY['poor mileage','soft handling','blowout','sidewall bulge'], ARRAY['all'], 'AutoServe Tyre Guide'),
('suspension', 'Worn shock absorbers', 'Bouncing more than 2 times after pushing the bonnet, nose-dive on braking, or oily residue on the strut indicates failure. Replace in pairs (₹3,500–₹8,000 per pair for hatchbacks). Bad shocks increase braking distance by 20%.', ARRAY['shock','absorber','strut','suspension','bounce'], ARRAY['bouncy ride','nose dive on braking','clunking over bumps','poor handling'], ARRAY['all'], 'AutoServe Suspension Manual'),
('transmission', 'AMT / DCT jerking', 'AMTs (Maruti Celerio, Renault Kwid) have inherent gear-change pause — release accelerator briefly for smoother shifts. DCTs (VW, Hyundai DCT) jerking at low speed often means clutch pack wear (₹40,000+ repair).', ARRAY['amt','dct','automatic','jerk','transmission','gear'], ARRAY['jerky shifts','hesitation','clunk between gears','slipping'], ARRAY['petrol','diesel'], 'AutoServe Transmission Guide'),
('transmission', 'Manual clutch slipping', 'Engine RPM rises but car does not accelerate proportionally = slipping clutch. Caused by oil contamination, worn friction plate, or aggressive launches. Clutch kit replacement ₹6,000–₹18,000 depending on model.', ARRAY['clutch','slip','manual','transmission'], ARRAY['rpm rising without speed','burning smell','high biting point','difficulty changing gear'], ARRAY['petrol','diesel'], 'AutoServe Transmission Guide'),
('ev', 'EV battery degradation in Indian heat', 'Lithium-ion cells degrade ~2-3% per year typically; Indian summers can push this to 4-5%. Avoid 100% charging when parked overnight; 80% target preserves capacity. DC fast charging above 50% adds wear — use sparingly.', ARRAY['ev','battery','degradation','range','charge'], ARRAY['reduced range','slow charging','battery warning'], ARRAY['ev'], 'BIS IS 17017 EV Standards'),
('ev', 'EV regenerative braking maintenance', 'EVs use brake pads ~3x less than ICE due to regen, but rotors can rust from disuse. Drive in low-regen mode occasionally and clean rotors with light braking on dry roads. Inspect annually.', ARRAY['ev','regen','brake','rotor','rust'], ARRAY['rough braking','rotor rust','squealing brakes'], ARRAY['ev'], 'AutoServe EV Library'),
('maintenance', 'Engine oil change intervals (India)', 'Mineral oil: 5,000 km. Semi-synthetic: 7,500 km. Full synthetic: 10,000–15,000 km. Indian dust and stop-go traffic warrants the lower end of the range. Always replace oil filter together (₹250–₹600).', ARRAY['oil','change','service','filter','interval'], ARRAY['dark oil','low oil pressure','engine ticking','poor mileage'], ARRAY['petrol','diesel'], 'API SN/SP Spec'),
('maintenance', 'Coolant flush schedule', 'Replace coolant every 40,000 km or 2 years. Use OEM-spec coolant (G12 / G13 for VW, Hyundai-Genuine for Hyundai/Kia). Mixing colours causes gel formation that blocks the radiator.', ARRAY['coolant','antifreeze','radiator','flush'], ARRAY['overheating','coolant warning','green/pink residue'], ARRAY['petrol','diesel'], 'AutoServe Cooling Guide'),
('maintenance', 'Monsoon car prep checklist', 'Before monsoon: check wiper blades (₹400–₹1,200), tyre tread depth (>2mm), all lights, drain plugs in doors, AC dryer condition. Carry a tow rope and avoid driving through water above the bumper.', ARRAY['monsoon','rain','wiper','flood','prep'], ARRAY['wiper smearing','foggy windscreen','headlight condensation','water leak'], ARRAY['all'], 'AutoServe Seasonal Guide'),
('safety', 'ABS warning light', 'Yellow ABS light = anti-lock braking disabled but normal brakes still work. Causes: bad wheel-speed sensor (~₹2,500), low brake fluid, or ECU fault. Get diagnosed before next monsoon — ABS is critical on wet roads.', ARRAY['abs','warning','sensor','wheel','speed'], ARRAY['abs light on','wheel locking on hard braking','clicking pedal'], ARRAY['all'], 'AIS-145 ABS Standard'),
('safety', 'Airbag warning light', 'Red SRS / airbag light means the system is disabled and may not deploy in a crash. Common causes: loose passenger seat sensor, corroded clock-spring connector. Diagnose immediately — DIY reset is unsafe.', ARRAY['airbag','srs','warning','crash','sensor'], ARRAY['airbag light','srs warning','seat belt warning'], ARRAY['all'], 'AIS-098 Airbag Standard'),
('fuel', 'Sudden mileage drop', 'A 15%+ drop in fuel economy points to: clogged air filter, dirty spark plugs (replace every 30,000 km), failing O2 sensor, dragging brakes, or under-inflated tyres. Start with the cheapest fixes.', ARRAY['mileage','fuel','economy','efficiency'], ARRAY['poor mileage','frequent refills','rough idle'], ARRAY['petrol','diesel'], 'AutoServe Efficiency Guide'),
('exterior', 'Headlight yellowing', 'UV oxidation cloudy headlights cut light output by up to 60%. Polishing kit (₹500–₹1,500) restores clarity for ~6 months; full replacement is ₹3,000–₹15,000 depending on model. Apply UV-protectant after polishing.', ARRAY['headlight','yellow','cloudy','polish','uv'], ARRAY['dim headlights','cloudy lens','poor night visibility'], ARRAY['all'], 'AutoServe Detailing Guide'),
('interior', 'Sunroof drain blockage', 'Indian dust and leaves clog sunroof drains, causing water to overflow into the cabin during rain. Clean drain channels every 6 months with a soft wire or compressed air. Damp footwell carpets are an early sign.', ARRAY['sunroof','drain','leak','water','rain'], ARRAY['water in cabin','damp carpet','musty smell','headliner stains'], ARRAY['all'], 'AutoServe Detailing Guide');
