"use client"
import React from "react";
import { useForm } from "react-hook-form";
import { FaUser, FaCalendarAlt, FaSearch, FaRocket, FaShieldAlt, FaRegLightbulb, FaClock, FaMobileAlt, FaChartLine } from "react-icons/fa";

// Correct Swiper imports
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css'; // For Swiper core styles
import 'swiper/css/pagination'; // For Pagination styles
import 'swiper/css/navigation'; // For Navigation styles
import { Pagination, Navigation } from 'swiper/modules';
import { useRouter } from "next/navigation";
import { BenefitCard, Button, FeatureCard, InputField, ScreenshotCard, TextareaField } from "@/components/HomepageHelpers";

// Dummy data
const providerCount = 500;
const userCount = 10000;

export default function Page() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const router = useRouter();
  const onSubmit = (data: any) => {
    console.log(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-BGOne via-BGTwo to-white text-ColorTwo font-sans">
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-r from-ColorOne to-CustomBlue text-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="relative z-10">
            <h1 className="text-5xl font-bold mb-6">Revolutionize Your Appointment Booking Experience</h1>
            <p className="text-2xl mb-12">Effortless scheduling, enhanced efficiency, and happier customers await!</p>
            <div className="flex justify-center space-x-12 mb-16">
              <div className="bg-white text-ColorTwo p-6 rounded-lg shadow-lg flex flex-col items-center justify-center">
                <FaUser className="text-4xl mb-2 text-ColorOne" />
                <h3 className="font-bold text-3xl">{providerCount}+</h3>
                <p className="text-lg">Satisfied Providers</p>
              </div>
              <div className="bg-white text-ColorTwo p-6 rounded-lg shadow-lg flex flex-col items-center justify-center">
                <FaCalendarAlt className="text-4xl mb-2 text-ColorOne" />
                <h3 className="font-bold text-3xl">{userCount}+</h3>
                <p className="text-lg">Happy Users</p>
              </div>
            </div>
            <button onClick={() => router.push("/customerDashboard")} className="bg-ColorFour text-ColorTwo font-bold py-3 px-8 rounded-full text-lg hover:bg-ColorTwo hover:text-ColorFour transition-all duration-300">
              Get Started Now
            </button>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-ColorOne/60 via-CustomBlue/60 to-ColorOne/60"></div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white text-ColorTwo rounded-lg">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Powerful Features for Seamless Booking</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <FeatureCard
              title="Smart Scheduling"
              description="Our AI-powered algorithm optimizes appointment slots, reducing wait times and maximizing efficiency for both providers and users."
              Icon={FaCalendarAlt}
            />
            <FeatureCard
              title="Multi-platform Access"
              description="Book appointments anytime, anywhere with our responsive web and mobile apps. Stay connected on the go!"
              Icon={FaMobileAlt}
            />
            <FeatureCard
              title="Real-time Updates"
              description="Instant notifications for bookings, reminders, and changes. Never miss an appointment again!"
              Icon={FaClock}
            />
            <FeatureCard
              title="Custom Booking Rules"
              description="Set your own availability, buffer times, and booking preferences. Take control of your schedule like never before."
              Icon={FaSearch}
            />
            <FeatureCard
              title="Integrated Analytics"
              description="Gain valuable insights into booking patterns, popular time slots, and customer preferences to optimize your business."
              Icon={FaChartLine}
            />
            <FeatureCard
              title="Secure & Private"
              description="State-of-the-art encryption and privacy measures ensure your data and your clients' information stays safe and confidential."
              Icon={FaShieldAlt}
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-b from-ColorFour to-white text-ColorTwo rounded-lg mt-2">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Transform Your Business with Our Solution</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <BenefitCard
              index={1}
              title="Boost Productivity"
              description="Reduce no-shows by up to 80% and free up to 30% more time with automated scheduling and reminders."
              Icon={FaRocket}
            />
            <BenefitCard
              index={2}
              title="Enhance Customer Satisfaction"
              description="Provide a seamless booking experience that your clients will love, leading to higher retention rates and positive reviews."
              Icon={FaRegLightbulb}
            />
            <BenefitCard
              index={3}
              title="Grow Your Revenue"
              description="Maximize your booking potential and reduce gaps in your schedule, potentially increasing your revenue by up to 25%."
              Icon={FaChartLine}
            />
          </div>
        </div>
      </section>

      {/* Coming Soon Section */}
      <section className="p-8 bg-ColorFour text-center text-ColorTwo rounded-lg mt-2">
        <h2 className="text-3xl font-bold">AI-Powered Event Management System Coming Soon...</h2>
        <p className="text-lg mt-4">Our advanced AI system optimizes event scheduling and improves client satisfaction.</p>
      </section>

      {/* Screenshots Section */}
      <section className="py-24 bg-ColorTwo text-white rounded-t-lg mt-2">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Experience the Difference</h2>
          <div className="flex justify-center">
            <Swiper
              modules={[Pagination, Navigation]}
              spaceBetween={30}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              grabCursor={true}
              speed={500} // Slide transition duration in ms
              breakpoints={{
                640: {
                  slidesPerView: 1,
                },
                768: {
                  slidesPerView: 2,
                },
                1024: {
                  slidesPerView: 3,
                },
              }}
            >
              <SwiperSlide>
                <ScreenshotCard
                  imageUrl="/api/placeholder/600/400"
                  description="Intuitive Dashboard"
                />
              </SwiperSlide>
              <SwiperSlide>
                <ScreenshotCard
                  imageUrl="/api/placeholder/600/400"
                  description="Easy Appointment Scheduling"
                />
              </SwiperSlide>
              <SwiperSlide>
                <ScreenshotCard
                  imageUrl="/api/placeholder/600/400"
                  description="Comprehensive Provider Management"
                />

              </SwiperSlide>
              <SwiperSlide>
                <ScreenshotCard
                  imageUrl="/api/placeholder/600/400"
                  description="Comprehensive Provider Management"
                />

              </SwiperSlide>
              <SwiperSlide>
                <ScreenshotCard
                  imageUrl="/api/placeholder/600/400"
                  description="Comprehensive Provider Management"
                />

              </SwiperSlide>
            </Swiper>

          </div>
        </div>
      </section>

      {/* Support Form */}
      <section className="py-24 bg-white text-ColorTwo">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Get Personalized Support</h2>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="max-w-2xl mx-auto grid grid-cols-1 gap-8"
          >
            <InputField label="Your Name" name="name" register={register} error={errors.name} />
            <InputField label="Your Contact Info" name="contactInfo" register={register} error={errors.contactInfo} />
            <TextareaField label="How can we help you?" name="message" register={register} error={errors.message} />
            <Button type="submit" className="w-full py-3 bg-ColorOne text-white rounded-lg text-lg font-bold hover:bg-CustomBlue transition-colors duration-300">
              Send Message
            </Button>
          </form>
        </div>
      </section>

      <section>&#169; All rights reserved</section>
    </div>
  );
}
