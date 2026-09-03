import React from 'react';
import { MapPin, ExternalLink, Mail, Phone, Building2, Globe, Heart } from 'lucide-react';

export default function Contact() {
  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 py-10 transition-colors duration-300 text-slate-800 dark:text-slate-200 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Banner */}
        <div className="bg-linear-to-r from-indigo-900 via-purple-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl mb-10 text-left relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/30">
              Reach Out To Us
            </span>
            <h1 className="font-display font-black text-3xl sm:text-5xl mt-3 text-white">
              Contact & Location
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
              Have questions about competition rules, submission requirements, or partnership opportunities? We'd love to hear from you.
            </p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* 3 Column Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch text-left mb-12">
          
          {/* Column 1: Who We Are */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between h-full gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-4">
                <Heart size={20} />
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white uppercase tracking-wider">
                  Who We Are..
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
                Sumba was created in memory of Late Prof. Raosaheb Gurav, whose life was shaped by art, mentorship, and an unbreakable bond with tradition. His work, especially the Dhangar series, carried the landscapes of his childhood and the honesty of rural life, and his guidance helped generations of young artists find their path. He believed that art should stay rooted in its people and that every artist deserves a stage.
              </p>
            </div>
            
            {/* Social Media Icons */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-3">
                Connect With Us On
              </span>
              <div className="flex gap-4 text-slate-500 dark:text-slate-400">
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:text-red-500 transition-colors" title="YouTube">
                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.507 9.388.507 9.388.507s7.518 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:text-pink-500 transition-colors" title="Instagram">
                  <svg stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:text-sky-500 transition-colors" title="Twitter/X">
                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:text-blue-600 transition-colors" title="Facebook">
                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:text-emerald-500 transition-colors" title="WhatsApp">
                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.47l-6.256 1.647zM6.583 5.466c-.159-.353-.327-.361-.48-.367l-.407-.008c-.141 0-.37.053-.564.265-.194.212-.74.723-.74 1.761 0 1.038.756 2.04 8.62 10.22c.106.113 2.03 3.099 4.92 4.35 2.41 1.04 2.9.832 3.42.783.52-.049 1.674-.684 1.908-1.346.234-.662.234-1.23.164-1.346-.07-.116-.257-.185-.542-.327-.285-.141-1.674-.827-1.933-.922-.259-.095-.448-.141-.637.141-.189.283-.733.922-.897 1.111-.164.189-.328.212-.613.07-.285-.141-1.205-.444-2.295-1.416-.848-.756-1.42-1.69-1.586-1.97-.166-.282-.018-.435.124-.575.127-.126.284-.33.426-.496.142-.166.189-.283.284-.473.095-.19.048-.355-.024-.496-.071-.141-.637-1.536-.873-2.107z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Our Location */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between h-full gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-4">
                <MapPin size={20} />
                <h3 className="font-display font-bold text-base text-slate-900 dark:text-white uppercase tracking-wider">
                  Our Location
                </h3>
              </div>
              
              <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs">
                <iframe
                  title="Location Map"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=73.8400%2C18.5080%2C73.8550%2C18.5150&layer=mapnik&marker=18.511904%2C73.847844"
                  className="w-full h-full border-0"
                  loading="lazy"
                ></iframe>
              </div>
            </div>

            <a
              href="https://maps.google.com/?q=Trio+Chambers,+Sadashiv+Peth,+Pune+-+411030"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors self-start mt-auto"
            >
              <MapPin size={14} /> Open in Google Maps <ExternalLink size={13} />
            </a>
          </div>

          {/* Column 3: Support & Inquiries */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between h-full gap-5 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Mail size={20} />
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white uppercase tracking-wider">
                Support & Inquiries
              </h3>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Mail size={14} className="text-indigo-600 dark:text-indigo-400" /> Email:
              </span>
              <a href="mailto:support@sumbaranartsociety.com" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                support@sumbaranartsociety.com
              </a>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Phone size={14} className="text-indigo-600 dark:text-indigo-400" /> Phone:
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                +91 98765 43210 (Mon-Sat, 9AM - 6PM)
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Building2 size={14} className="text-indigo-600 dark:text-indigo-400" /> Address:
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
                1414/1A, Trio Chambers, Nr. Renuka Swaroop Girls High School, Sadashiv Peth, Pune - 411030
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Globe size={14} className="text-indigo-600 dark:text-indigo-400" /> Website:
              </span>
              <a href="https://sumbaranartsociety.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                https://sumbaranartsociety.com
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
