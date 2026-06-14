// src/components/OTPLoginForm.tsx
import React, { useState, useEffect } from 'react';
import { HiArrowRight } from 'react-icons/hi2';
import { HiOutlineRefresh } from 'react-icons/hi';
import Button from '@/components/UI/Button';

interface OTPLoginFormProps {
  onResendOTP?: () => void;
  resendDelay?: number; // seconds
}

const OTPLoginForm: React.FC<OTPLoginFormProps> = ({
  onResendOTP,
  resendDelay = 60,
}) => {
 

  return (
     
  );
};

export default OTPLoginForm;
