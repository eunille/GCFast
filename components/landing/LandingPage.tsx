"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Shield, Target, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/98 backdrop-blur-md border-b-2 border-[#095b4f]/10 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <Image 
                src="/gcfast_logo.png" 
                alt="GCFAS Logo" 
                width={48} 
                height={48}
                className="object-contain"
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-[#1E3A5F] leading-tight">GCFAS</span>
                <span className="text-xs text-gray-500 font-medium">Gordon College Faculty Association</span>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/login" className="text-[#1E3A5F] hover:text-[#095b4f] font-semibold transition-colors">
                Member Portal
              </Link>
              <Link href="/register">
                <Button className="bg-[#095b4f] hover:bg-[#074639] text-white font-semibold px-6 shadow-md">
                  Join Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/her_gcfas.png" 
            alt="Gordon College Faculty Association" 
            fill
            className="object-cover object-center"
            priority
            quality={100}
          />
          {/* Gradient Overlay - Lighter for better readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A5F]/85 via-[#095b4f]/80 to-[#074639]/85"></div>
          {/* Decorative Elements */}
          <div className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
          {/* Small Badge */}
          <div className="mb-8 inline-block">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2 rounded-full">
              <span className="text-white text-sm font-medium">Gordon College Faculty Association</span>
            </div>
          </div>

          {/* Main Heading - Clean and Bold */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
            Empowering Educators,
            <br />
            Building Excellence
          </h1>
          
          {/* Subtitle - Two Lines */}
          <p className="text-base sm:text-lg md:text-xl text-white/85 leading-relaxed max-w-3xl mx-auto mb-10">
            Advancing professional development, protecting member interests, and building
            <br className="hidden sm:block" />
            a thriving academic community for Gordon College faculty
          </p>
          
          {/* Single Primary CTA */}
          <div className="mb-12">
            <Link href="/register">
              <Button size="lg" className="bg-white text-[#095b4f] hover:bg-gray-50 px-10 py-6 text-lg font-bold shadow-2xl hover:shadow-white/30 transition-all transform hover:scale-105 rounded-full">
                Join GCFAS Today
              </Button>
            </Link>
          </div>

          {/* Trust/Info Line */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-white/70 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              <span>Official Faculty Organization</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              <span>Serving Gordon College Since Establishment</span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              <span>Member-Focused Services</span>
            </div>
          </div>
        </div>

      </section>

      {/* Welcome Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-[#1E3A5F] mb-6">
              Welcome to GCFAS
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#095b4f] to-[#1E3A5F] mx-auto mb-8"></div>
          </div>

          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              The <span className="font-semibold text-[#1E3A5F]">Gordon College Faculty Association (GCFAS)</span> is the duly recognized organization representing the teaching personnel of Gordon College. It serves as a unifying body that promotes the welfare, professional growth, and collective interests of the faculty while fostering collaboration, excellence, and service within the academic community.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              GCFAS actively partners with the College in advancing quality education, strengthening institutional initiatives, and cultivating a supportive environment for both educators and learners.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Through various programs, activities, and community engagement initiatives, GCFAS empowers faculty members to grow professionally, build meaningful connections, and contribute to the continuous development of Gordon College. Guided by the values of <span className="font-semibold text-[#095b4f]">Character, Excellence, and Service</span>, the Association remains committed to creating a positive and inclusive academic environment where faculty members can thrive and make a lasting impact.
            </p>
          </div>
        </div>
      </section>

      {/* Mission, Vision & Core Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Banner */}
          <div className="bg-gray-100 rounded-3xl p-16 mb-12 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Empowering Faculty Excellence & Professional Growth
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto text-lg">
              We promote the welfare and professional development of Gordon College faculty members through collaboration, innovation, and dedicated service to the academic community.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Mission Card - Bottom Left */}
            <Card className="bg-gray-50 shadow-lg hover:shadow-xl transition-shadow self-end">
              <CardContent className="p-0">
                {/* Illustration */}
                <div className="bg-white p-8 flex items-center justify-center h-64">
                  <div className="w-32 h-32 bg-gradient-to-br from-[#095b4f] to-[#095b4f]/70 rounded-full flex items-center justify-center shadow-2xl">
                    <Target className="w-20 h-20 text-white" strokeWidth={1.5} />
                  </div>
                </div>
                {/* Content */}
                <div className="p-8 border-t-4 border-black">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">Mission</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    To promote the welfare, professional development, and active participation of Gordon College faculty members while supporting academic excellence and community service.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Vision Card - Center */}
            <Card className="bg-gray-50 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-0">
                {/* Illustration */}
                <div className="bg-white p-8 flex items-center justify-center h-64">
                  <div className="w-32 h-32 bg-gradient-to-br from-[#1E3A5F] to-[#1E3A5F]/70 rounded-full flex items-center justify-center shadow-2xl">
                    <Eye className="w-20 h-20 text-white" strokeWidth={1.5} />
                  </div>
                </div>
                {/* Content */}
                <div className="p-8 border-t-4 border-black">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">Vision</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    A united, empowered, and innovative faculty association that champions excellence in education, leadership, and public service.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Core Values Card - Top Right */}
            <Card className="bg-gray-50 shadow-lg hover:shadow-xl transition-shadow self-start">
              <CardContent className="p-0">
                {/* Illustration */}
                <div className="bg-white p-8 flex items-center justify-center h-64">
                  <div className="w-32 h-32 bg-gradient-to-br from-[#2E86C1] to-[#2E86C1]/70 rounded-full flex items-center justify-center shadow-2xl">
                    <Shield className="w-20 h-20 text-white" strokeWidth={1.5} />
                  </div>
                </div>
                {/* Content */}
                <div className="p-8 border-t-4 border-black">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">Core Values</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    <span className="font-semibold text-[#095b4f]">Character</span> - Integrity & professionalism. <span className="font-semibold text-[#1E3A5F]">Excellence</span> - Quality in teaching. <span className="font-semibold text-[#2E86C1]">Service</span> - Dedication to community.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Activities Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#1E3A5F] mb-4">
              Recent Activities & Events
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Stay updated with the latest happenings in our association
            </p>
          </div>

          <Carousel 
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-5xl mx-auto mb-8"
          >
            <CarouselContent>
              {/* Faculty General Assembly 2026 */}
              <CarouselItem className="md:basis-1/2 lg:basis-1/2">
                <div className="p-2">
                  <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow h-full">
                    <div className="relative h-56">
                      <Image 
                        src="/gcfas_activites/gcfas_general_ass.jpg" 
                        alt="Gordon College Faculty General Assembly 2026" 
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6">
                <h3 className="font-bold text-xl text-[#1E3A5F] mb-3">Gordon College Faculty General Assembly 2026</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Together, we strengthen our commitment to excellence, collaboration, and growth! The Gordon College Faculty Association invites you to the Faculty General Assembly for A.Y. 2026-2027 on <span className="font-semibold">July 15, 2026</span> at Gordon College Library.
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  As we begin another academic year, let us come together to celebrate our shared accomplishments, discuss important updates, and strengthen the collaboration that empowers our academic community.
                </p>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    <span className="font-semibold text-[#095b4f]">Location:</span> RM312, 3rd Floor, Gordon College
                  </p>
                      <p className="text-xs text-gray-400 mt-1">July 15, 2026</p>
                    </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>

              {/* Faculty Wellness Program: Free Tetanus-Diphtheria Vaccination */}
              <CarouselItem className="md:basis-1/2 lg:basis-1/2">
                <div className="p-2">
                  <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow h-full">
                    <div className="relative h-56">
                      <Image 
                        src="/gcfas_activites/gcfas_free_tetanus.jpg" 
                        alt="Gordon College Faculty Wellness Program" 
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-xl text-[#1E3A5F] mb-3">Gordon College Faculty Wellness Program: Free Tetanus-Diphtheria Vax 💪🏻💉</h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">
                        As part of the <span className="font-semibold">Faculty Wellness Program</span>, the BSM Program Chair and CAHS CESU Coordinator, in collaboration with <span className="font-semibold text-[#095b4f]">GCFAS</span>, is offering free Anti-Tetanus with Diphtheria (Td) Vaccination.
                      </p>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        Interested Gordon College Full-time Faculty Members may proceed to <span className="font-semibold">RM119</span> and look for Ms. Maria Sandra C. Rivera. Limited slots only so don't miss this opportunity to protect yourself and others! 🙌🏻
                      </p>
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          <span className="font-semibold text-[#095b4f]">Location:</span> RM119, Gordon College
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Faculty Wellness Program</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>

              {/* Gordon College Women's Sway and Shake */}
              <CarouselItem className="md:basis-1/2 lg:basis-1/2">
                <div className="p-2">
                  <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow h-full">
                    <div className="relative h-56">
                      <Image 
                        src="/gcfas_activites/gcfas_women_sway.jpg" 
                        alt="Gordon College Women's Sway and Shake" 
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-xl text-[#1E3A5F] mb-3">Gordon College Women's Sway and Shake 💃🎶</h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">
                        The <span className="font-semibold text-[#095b4f]">GCFAS</span> would like to inform everyone that the scheduled <span className="font-semibold">Women's Sway and Shake</span>, originally set for March 27, 2026, in celebration of National Women's Month, has been postponed.
                      </p>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        This decision is made in compliance with Executive Order No. 029, particularly Section 2(b), which implements a four-day work week arrangement, designating Fridays as work-from-home days. Let us continue to uplift and empower one another in our community. See you soon as we celebrate women! 🙌🏻
                      </p>
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          <span className="font-semibold text-[#095b4f]">Event:</span> National Women's Month Celebration
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Postponed - March 27, 2026</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>

              {/* Gordon College First Friday Mass */}
              <CarouselItem className="md:basis-1/2 lg:basis-1/2">
                <div className="p-2">
                  <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow h-full">
                    <div className="relative h-56">
                      <Image 
                        src="/gcfas_activites/gcfas_friday_mass.jpg" 
                        alt="Gordon College First Friday Mass" 
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-xl text-[#1E3A5F] mb-3">Gordon College First Friday Mass ✝️🙏🏻</h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">
                        As we journey through the sacred season of Lent, join us for our <span className="font-semibold">First Friday Mass</span> on March 6, 2026 at Gordon College Function Hall.
                      </p>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        <span className="font-semibold text-[#095b4f]">GCFAS</span>, in partnership with the Human Resource Management Unit, invites everyone to pause, reflect, and renew our hearts through prayer and thanksgiving. As the Gospel of Lent calls us to repentance, humility, and compassion, may this Eucharistic celebration strengthen us to live out our faith through service and love for others. 🙌🏻
                      </p>
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          <span className="font-semibold text-[#095b4f]">Location:</span> Gordon College Function Hall
                        </p>
                        <p className="text-xs text-gray-400 mt-1">March 6, 2026</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              For more information, visit the <span className="font-semibold text-[#095b4f]">GCFAS Office at RM312, 3rd Floor, Gordon College</span>
            </p>
            <p className="text-sm text-gray-600">
              or message us through our <span className="font-semibold text-[#1E3A5F]">Facebook Page</span>
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#095b4f] to-[#074639]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Join Gordon College Faculty Association
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Start managing memberships and tracking payments efficiently with our dedicated platform for Gordon College faculty
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-[#095b4f] hover:bg-gray-100 px-10 font-semibold">
                Register Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#095b4f] px-10 font-semibold transition-all">
                Sign In
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-white/80 text-sm">Exclusively for Gordon College Faculty Members</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <Image 
                  src="/gcfast_logo.png" 
                  alt="GCFAS Logo" 
                  width={36} 
                  height={36}
                  className="object-contain"
                />
                <span className="text-xl font-bold">GCFAS</span>
              </div>
              <p className="text-gray-400 text-sm max-w-md mb-4">
                Gordon College Faculty Association Membership & Payment Tracking System - Streamlining membership and payment tracking for faculty excellence.
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Shield className="h-4 w-4 text-[#095b4f]" />
                <span>Secure & Trusted Platform</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Register</Link></li>
                <li><Link href="/register/treasurer" className="hover:text-white transition-colors">Treasurer Registration</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Gordon College</li>
                <li>Tapinac Oval Sports Complex, 2200</li>
                <li className="text-[#2E86C1]">0970 212 4653</li>
                <li className="text-[#2E86C1]">gcfas@gordoncollege.edu.ph</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
            <p>© 2026 Gordon College Faculty Association. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
