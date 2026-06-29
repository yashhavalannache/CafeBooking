import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, ChevronDown, ChevronUp, CheckCircle, RefreshCw, Instagram, Facebook, Twitter } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';
import { supabase } from '../lib/supabase';
import { toast } from '../components/Toast';

const FAQS = [
  { q: 'Do I need a reservation to visit?', a: 'Walk-ins are welcome, but we recommend reserving a table especially on weekends and evenings to avoid waiting.' },
  { q: 'Is there parking available?', a: 'Yes, complimentary parking is available for up to 2 hours in the building basement for café guests.' },
  { q: 'Do you accommodate dietary restrictions?', a: 'Absolutely. We have vegan, gluten-free, and dairy-free options. Please inform our staff when ordering and we will guide you.' },
  { q: 'Can I host private events at the café?', a: 'Yes! We have a private dining area that accommodates up to 20 guests. Contact us at least a week in advance for event bookings.' },
  { q: 'Do you offer home delivery?', a: 'We partner with Zomato and Swiggy for home delivery. Search "Brewed & Bliss" on either app to order your favourites.' },
  { q: 'Is the café pet-friendly?', a: 'Yes! We have a pet-friendly outdoor seating area. Well-behaved leashed pets are always welcome.' },
];

function FAQItem({ faq }: { faq: typeof FAQS[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[#E6D3B3] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-[#FFF8E7] transition-colors"
      >
        <span className="text-sm font-medium text-[#2E1A12] pr-4">{faq.q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-[#D4AF37] flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-[#6F4E37]/60 flex-shrink-0" />}
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-48' : 'max-h-0'}`}>
        <p className="px-5 py-4 text-sm text-[#4E342E]/75 leading-relaxed bg-[#FFF8E7] border-t border-[#E6D3B3]">{faq.a}</p>
      </div>
    </div>
  );
}

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Valid email required';
    if (!form.message.trim()) errs.message = 'Message is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const { error } = await supabase.from('contact_messages').insert(form);
    setSubmitting(false);
    if (error) {
      toast('Failed to send. Please try again.', 'error');
      return;
    }
    setSubmitted(true);
    setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    toast('Message sent! We will get back to you soon.', 'success');
  };

  const inputCls = (field: string) =>
    `w-full px-4 py-3 bg-white border rounded-xl text-[#2E1A12] text-sm placeholder-[#6F4E37]/40 focus:outline-none focus:ring-2 transition-all ${
      errors[field] ? 'border-red-400 focus:ring-red-100' : 'border-[#E6D3B3] focus:border-[#D4AF37] focus:ring-[#D4AF37]/20'
    }`;

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      {/* Header */}
      <div className="bg-[#2E1A12] pt-32 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold mb-3">Get In Touch</p>
            <h1 className="font-display text-5xl lg:text-6xl font-bold text-[#FFF8E7] mb-4">
              We'd Love to <span className="text-gold-gradient italic">Hear You</span>
            </h1>
            <p className="text-[#E6D3B3]/70 max-w-xl mx-auto">Questions, feedback, or just want to say hi — we are here for you.</p>
          </AnimatedSection>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <AnimatedSection animation="fade-in-left">
            <div className="space-y-8">
              <div>
                <h2 className="font-display text-2xl font-bold text-[#2E1A12] mb-6">Contact Information</h2>
                <div className="space-y-5">
                  {[
                    { icon: MapPin, title: 'Address', text: '42 Coffee Lane, Indiranagar\nBengaluru, Karnataka 560038' },
                    { icon: Phone, title: 'Phone', text: '+91 80 1234 5678' },
                    { icon: Mail, title: 'Email', text: 'hello@brewedandbliss.in' },
                  ].map(item => (
                    <div key={item.title} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#4E342E]/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-[#4E342E]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#D4AF37] font-semibold uppercase tracking-wide mb-0.5">{item.title}</p>
                        <p className="text-sm text-[#4E342E]/80 whitespace-pre-line leading-relaxed">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hours */}
              <div className="bg-[#2E1A12] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-[#D4AF37]" />
                  <h3 className="font-display font-semibold text-[#FFF8E7]">Opening Hours</h3>
                </div>
                <div className="space-y-2">
                  {[
                    { day: 'Mon – Fri', time: '7:00 AM – 10:00 PM' },
                    { day: 'Saturday', time: '8:00 AM – 11:00 PM' },
                    { day: 'Sunday', time: '9:00 AM – 9:00 PM' },
                  ].map(h => (
                    <div key={h.day} className="flex justify-between text-sm">
                      <span className="text-[#E6D3B3]/60">{h.day}</span>
                      <span className="text-[#FFF8E7] font-medium">{h.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Socials */}
              <div>
                <h3 className="font-display font-semibold text-[#2E1A12] mb-4">Follow Us</h3>
                <div className="flex gap-3">
                  {[
                    { icon: Instagram, label: '@brewedandbliss' },
                    { icon: Facebook, label: 'Brewed & Bliss' },
                    { icon: Twitter, label: '@brewedbliss' },
                  ].map(s => (
                    <a
                      key={s.label}
                      href="#"
                      className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E6D3B3] rounded-xl text-xs text-[#4E342E] hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all group"
                    >
                      <s.icon className="w-4 h-4 group-hover:text-[#D4AF37]" />
                      <span className="hidden sm:inline">{s.label}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Map */}
              <div className="rounded-2xl overflow-hidden border border-[#E6D3B3] h-48 shadow-sm">
                <iframe
                  title="Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.8541!2d77.6394!3d12.9784!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU4JzQyLjIiTiA3N8KwMzgnMjEuOCJF!5e0!3m2!1sen!2sin!4v1629790000000!5m2!1sen!2sin"
                  width="100%" height="100%" style={{ border: 0, filter: 'sepia(15%)' }} allowFullScreen loading="lazy"
                />
              </div>
            </div>
          </AnimatedSection>

          {/* Contact Form */}
          <AnimatedSection animation="fade-in-right">
            <div className="bg-white rounded-2xl border border-[#E6D3B3] p-8 shadow-sm">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-9 h-9 text-green-600" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-[#2E1A12] mb-2">Message Sent!</h3>
                  <p className="text-[#6F4E37]/70 text-sm mb-6">We will get back to you within 24 hours.</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-sm text-[#D4AF37] font-medium hover:text-[#C8A228] transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="font-display text-2xl font-bold text-[#2E1A12] mb-6">Send a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#4E342E] mb-1.5">Name</label>
                        <input type="text" placeholder="Your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls('name')} />
                        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#4E342E] mb-1.5">Email</label>
                        <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls('email')} />
                        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#4E342E] mb-1.5">Phone <span className="text-[#6F4E37]/50 font-normal">(optional)</span></label>
                        <input type="tel" placeholder="9876543210" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputCls('phone')} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#4E342E] mb-1.5">Subject</label>
                        <input type="text" placeholder="How can we help?" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className={inputCls('subject')} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#4E342E] mb-1.5">Message</label>
                      <textarea
                        placeholder="Tell us more…"
                        rows={5}
                        value={form.message}
                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                        className={`${inputCls('message')} resize-none`}
                      />
                      {errors.message && <p className="text-xs text-red-600 mt-1">{errors.message}</p>}
                    </div>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-ripple w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#C8A228] text-[#2E1A12] py-4 rounded-xl font-semibold text-sm hover:shadow-xl hover:shadow-[#D4AF37]/20 hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {submitting ? <><RefreshCw className="w-4 h-4 animate-spin" /> Sending…</> : <><Send className="w-4 h-4" /> Send Message</>}
                    </button>
                  </form>
                </>
              )}
            </div>
          </AnimatedSection>
        </div>

        {/* FAQ */}
        <AnimatedSection className="mt-16">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.25em] text-[#D4AF37] font-semibold mb-3">FAQ</p>
            <h2 className="font-display text-4xl font-bold text-[#2E1A12]">
              Frequently Asked <span className="text-[#6F4E37] italic">Questions</span>
            </h2>
          </div>
          <div className="max-w-2xl mx-auto space-y-3">
            {FAQS.map((faq, i) => (
              <AnimatedSection key={i} delay={i * 60}>
                <FAQItem faq={faq} />
              </AnimatedSection>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}
