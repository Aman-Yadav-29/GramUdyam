import React from 'react';
import { Sprout, ExternalLink, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-stone-200 bg-white py-12 text-stone-600 text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Platform identity */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2 text-stone-900 font-heading font-extrabold text-base">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-700 text-white">
                <Sprout className="h-4 w-4" />
              </div>
              <span>GramUdyam</span>
            </div>
            <p className="text-stone-500 leading-relaxed text-xs">
              Turn your business idea into a practical plan. Bridging capital discovery, location intelligence, and government credit subsidies for Indian micro-enterprises.
            </p>
            <div className="flex items-center gap-1.5 text-2xs text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 w-fit">
              <Shield className="h-3 w-3 text-emerald-700" />
              <span>Empowering Rural & MSME Enterprises</span>
            </div>
          </div>

          {/* Col 2: Core Capabilities */}
          <div>
            <h4 className="font-bold text-stone-900 uppercase tracking-wider text-2xs mb-3">
              Core Capabilities
            </h4>
            <ul className="space-y-2">
              <li><span className="text-stone-600 hover:text-stone-900">Capital-to-Idea Matcher</span></li>
              <li><span className="text-stone-600 hover:text-stone-900">CAPEX & Working Capital Sizing</span></li>
              <li><span className="text-stone-600 hover:text-stone-900">GIS District Intelligence Catchment</span></li>
              <li><span className="text-stone-600 hover:text-stone-900">Bank DSCR & Amortization Modeler</span></li>
              <li><span className="text-stone-600 hover:text-stone-900">Bankable Detailed Project Report (DPR)</span></li>
            </ul>
          </div>

          {/* Col 3: Government Scheme Portals */}
          <div>
            <h4 className="font-bold text-stone-900 uppercase tracking-wider text-2xs mb-3">
              Official Scheme Portals
            </h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://www.kviconline.gov.in/pmegpeportal/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-emerald-700 transition"
                >
                  <span>PMEGP Online Portal (KVIC)</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://pmfme.mofpi.gov.in/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-emerald-700 transition"
                >
                  <span>PMFME Food Processing Portal</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://www.mudra.org.in/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-emerald-700 transition"
                >
                  <span>MUDRA Scheme (PMMY)</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a 
                  href="https://udyamregistration.gov.in/" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 hover:text-emerald-700 transition"
                >
                  <span>Udyam National MSME Portal</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform Advisory */}
          <div>
            <h4 className="font-bold text-stone-900 uppercase tracking-wider text-2xs mb-3">
              Enterprise Advisory
            </h4>
            <p className="text-stone-500 text-2xs leading-relaxed mb-2">
              Transforming fragmented rural schemes and capital constraints into bankable enterprise roadmaps.
            </p>
            <div className="space-y-1.5 text-2xs text-stone-600">
              <div>• Enterprise Discovery & Sizing</div>
              <div>• District Raw Material Matching</div>
              <div>• Capital Subsidy Evaluation (PMEGP/PMFME)</div>
              <div>• Bank Appraisal & Execution Timelines</div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-400 text-2xs">
          <div>
            © {new Date().getFullYear()} GramUdyam Enterprise Intelligence. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-stone-500">
            <span>District Industries Center (DIC) Standards</span>
            <span>•</span>
            <span>Reserve Bank of India Priority Sector Lending (PSL) Aligned</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
