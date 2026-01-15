import { useState } from "react";
import { router, usePage } from '@inertiajs/react';
import Swal from 'sweetalert2';
import Navigation from './Navigation';
import ComponentCard from '@/components/ComponentCard';
import Label from '@/components/Label';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Radio from '@/components/Radio';
import DropZone from '@/components/DropZone';

export default function ShopOwnerRegistration() {
  const { csrf_token } = usePage().props;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    businessName: "",
    businessAddress: "",
    businessType: "",
    registrationType: "individual",
  });

  const [operatingHours, setOperatingHours] = useState([
    { day: "Monday", open: "09:00", close: "17:00" },
    { day: "Tuesday", open: "09:00", close: "17:00" },
    { day: "Wednesday", open: "09:00", close: "17:00" },
    { day: "Thursday", open: "09:00", close: "17:00" },
    { day: "Friday", open: "09:00", close: "17:00" },
    { day: "Saturday", open: "09:00", close: "17:00" },
    { day: "Sunday", open: "09:00", close: "17:00" },
  ]);

  const [agreesToRequirements, setAgreesToRequirements] = useState(false);

  const [uploadedDocuments, setUploadedDocuments] = useState({
    dtiRegistration: null,
    mayorsPermit: null,
    birCertificate: null,
    validId: null,
  });

  const businessTypeOptions = [
    { value: "retail", label: "Retail" },
    { value: "repair", label: "Repair" },
    { value: "both (retail & repair)", label: "both (retail & repair)" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData(prev => ({ ...prev, businessType: value }));
  };

  const handleRegistrationTypeChange = (value) => {
    setFormData(prev => ({ ...prev, registrationType: value }));
  };

  const handleOperatingHoursChange = (index, field, value) => {
    const updatedHours = [...operatingHours];
    updatedHours[index][field] = value;
    setOperatingHours(updatedHours);
  };

  const documentLabels = {
    dtiRegistration: 'Business Registration (DTI/SEC)',
    mayorsPermit: "Mayor's Permit",
    birCertificate: 'BIR Certificate',
    validId: 'Valid ID of Owner',
  };

  const handleDocumentUpload = (documentType, acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      if (!['image/png', 'image/jpeg'].includes(file.type)) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File Type',
          text: 'Only PNG and JPG files are allowed',
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: 'error',
          title: 'File Too Large',
          text: 'Maximum file size is 5MB',
        });
        return;
      }

      setUploadedDocuments(prev => ({
        ...prev,
        [documentType]: file
      }));

      const label = documentLabels[documentType] || 'document';
      Swal.fire({
        icon: 'info',
        title: 'File Attached',
        html: `<p><strong>${file.name}</strong> was added to <strong>${label}</strong>.</p><p class="text-sm text-gray-600">Please ensure the correct document is uploaded in this section.</p>`,
        confirmButtonText: 'OK',
      });
    }
  };

  const validateForm = () => {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'businessName', 'businessAddress', 'businessType'];
    
    for (const field of requiredFields) {
      if (!formData[field]) {
        return false;
      }
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return false;
    }
    
    const phoneRegex = /^\d{7,}$/;
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      return false;
    }
    
    if (!uploadedDocuments.dtiRegistration || !uploadedDocuments.mayorsPermit || 
        !uploadedDocuments.birCertificate || !uploadedDocuments.validId) {
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      if (!uploadedDocuments.dtiRegistration || !uploadedDocuments.mayorsPermit || 
          !uploadedDocuments.birCertificate || !uploadedDocuments.validId) {
        
        const missing = [];
        if (!uploadedDocuments.dtiRegistration) missing.push('Business Registration (DTI/SEC)');
        if (!uploadedDocuments.mayorsPermit) missing.push("Mayor's Permit");
        if (!uploadedDocuments.birCertificate) missing.push('BIR Certificate');
        if (!uploadedDocuments.validId) missing.push('Valid ID');
        
        Swal.fire({
          icon: 'error',
          title: 'Missing Required Documents',
          html: `<p>Please upload: ${missing.join(', ')}</p>`,
        });
        return;
      }

      Swal.fire({
        icon: 'error',
        title: 'Invalid Form Data',
        text: 'Please fill in all required fields correctly.',
      });
      return;
    }

    const permitsResult = await Swal.fire({
      title: 'Business Permits & Valid ID Required',
      html: `<div style="text-align: left;"><p><strong>📋 Confirm you have:</strong></p><ul><li>✓ Business Registration</li><li>✓ Mayor's Permit</li><li>✓ BIR Certificate</li><li>✓ Valid ID</li></ul></div>`,
      icon: 'warning',
      confirmButtonText: 'Confirmed',
      cancelButtonText: 'Cancel',
      showCancelButton: true,
    });

    if (!permitsResult.isConfirmed) return;

    const confirmResult = await Swal.fire({
      title: 'Confirm Submission',
      html: `<p><strong>Name:</strong> ${formData.firstName} ${formData.lastName}<br/><strong>Email:</strong> ${formData.email}<br/><strong>Business:</strong> ${formData.businessName}</p>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Submit',
      cancelButtonText: 'Cancel',
    });

    if (!confirmResult.isConfirmed) return;

    setIsSubmitting(true);

    const formDataToSend = new FormData();
    formDataToSend.append('firstName', formData.firstName);
    formDataToSend.append('lastName', formData.lastName);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('phone', formData.phone);
    formDataToSend.append('businessName', formData.businessName);
    formDataToSend.append('businessAddress', formData.businessAddress);
    formDataToSend.append('businessType', formData.businessType);
    formDataToSend.append('registrationType', formData.registrationType);
    operatingHours.forEach((hours, index) => {
      formDataToSend.append(`operatingHours[${index}][day]`, hours.day);
      formDataToSend.append(`operatingHours[${index}][open]`, hours.open);
      formDataToSend.append(`operatingHours[${index}][close]`, hours.close);
    });

    formDataToSend.append('agreesToRequirements', agreesToRequirements ? '1' : '0');
    
    if (uploadedDocuments.dtiRegistration) {
      formDataToSend.append('dtiRegistration', uploadedDocuments.dtiRegistration);
    }
    if (uploadedDocuments.mayorsPermit) {
      formDataToSend.append('mayorsPermit', uploadedDocuments.mayorsPermit);
    }
    if (uploadedDocuments.birCertificate) {
      formDataToSend.append('birCertificate', uploadedDocuments.birCertificate);
    }
    if (uploadedDocuments.validId) {
      formDataToSend.append('validId', uploadedDocuments.validId);
    }

    router.post('/shop/register-full', formDataToSend, {
      preserveScroll: true,
      onSuccess: () => {
        setIsSubmitting(false);
        
        Swal.fire({
          title: '✅ Success!',
          html: '<p>Your registration was submitted successfully!</p><p><small>Review time: 3-7 business days</small></p>',
          icon: 'success',
          confirmButtonText: 'OK',
        });

        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          businessName: "",
          businessAddress: "",
          businessType: "",
          registrationType: "individual",
        });
        setAgreesToRequirements(false);
        setUploadedDocuments({
          dtiRegistration: null,
          mayorsPermit: null,
          birCertificate: null,
          validId: null,
        });
      },
      onError: (errors) => {
        setIsSubmitting(false);
        Swal.fire({
          title: '❌ Error',
          text: Object.values(errors)[0] || 'Registration failed',
          icon: 'error',
        });
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="w-full bg-white py-16 lg:py-20 mb-6">
        <div className="max-w-4xl mx-auto px-6 lg:px-12">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-black mb-6 tracking-tight">
              SHOP OWNER REGISTRATION
            </h1>
            <p className="text-xl text-black/70 max-w-2xl mx-auto leading-relaxed font-light mb-8">
              Join our premium network of verified shop owners and repairers. Complete your registration to unlock exclusive benefits.
            </p>
            <p className="text-sm text-black/50 uppercase tracking-wider font-semibold">
              Exclusive for Shop Owners & Repairers
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-12 pb-20">
        <div className="space-y-6">
          <ComponentCard title="Personal Information">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Business Information">
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    type="text"
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    placeholder="Enter business name"
                  />
                </div>
                <div>
                  <Label htmlFor="businessAddress">Business Address</Label>
                  <Input
                    type="text"
                    id="businessAddress"
                    name="businessAddress"
                    value={formData.businessAddress}
                    onChange={handleInputChange}
                    placeholder="Enter business address"
                  />
                </div>
              </div>
              <div>
                <Label>Business Type</Label>
                <Select
                  options={businessTypeOptions}
                  value={formData.businessType}
                  placeholder="Select business type"
                  onChange={handleSelectChange}
                />
              </div>

              <div>
                <Label>Registration Type</Label>
                <div className="flex flex-wrap items-center gap-8">
                  <Radio
                    id="individual"
                    name="registrationType"
                    value="individual"
                    checked={formData.registrationType === "individual"}
                    onChange={handleRegistrationTypeChange}
                    label="Registered as Individual"
                  />
                  <Radio
                    id="company"
                    name="registrationType"
                    value="company"
                    checked={formData.registrationType === "company"}
                    onChange={handleRegistrationTypeChange}
                    label="Registered as Company"
                  />
                </div>
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Upload Required Documents">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                PNG or JPG only, max 5MB per file. Files must be actually uploaded – not just marked.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Business Registration (DTI/SEC) <span className="text-red-500">*</span></Label>
                  <DropZone inputId="dti-registration" accept="image/png, image/jpeg" onDrop={(files) => handleDocumentUpload('dtiRegistration', files)} />
                  {uploadedDocuments.dtiRegistration && (
                    <p className="text-xs text-green-600 font-semibold mt-1">✓ {uploadedDocuments.dtiRegistration.name}</p>
                  )}
                </div>
                <div>
                  <Label>Mayor's Permit <span className="text-red-500">*</span></Label>
                  <DropZone inputId="mayors-permit" accept="image/png, image/jpeg" onDrop={(files) => handleDocumentUpload('mayorsPermit', files)} />
                  {uploadedDocuments.mayorsPermit && (
                    <p className="text-xs text-green-600 font-semibold mt-1">✓ {uploadedDocuments.mayorsPermit.name}</p>
                  )}
                </div>
                <div>
                  <Label>BIR Certificate (COR) <span className="text-red-500">*</span></Label>
                  <DropZone inputId="bir-certificate" accept="image/png, image/jpeg" onDrop={(files) => handleDocumentUpload('birCertificate', files)} />
                  {uploadedDocuments.birCertificate && (
                    <p className="text-xs text-green-600 font-semibold mt-1">✓ {uploadedDocuments.birCertificate.name}</p>
                  )}
                </div>
                <div>
                  <Label>Valid ID of Owner <span className="text-red-500">*</span></Label>
                  <DropZone inputId="valid-id" accept="image/png, image/jpeg" onDrop={(files) => handleDocumentUpload('validId', files)} />
                  {uploadedDocuments.validId && (
                    <p className="text-xs text-green-600 font-semibold mt-1">✓ {uploadedDocuments.validId.name}</p>
                  )}
                </div>
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Operating Hours">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Set your shop's operating hours for each day of the week.
              </p>
              <div className="grid grid-cols-1 gap-4">
                {operatingHours.map((hours, index) => (
                  <div key={hours.day} className="flex items-center gap-4">
                    <Label className="w-24">{hours.day}</Label>
                    <Input
                      type="time"
                      value={hours.open}
                      onChange={(e) => handleOperatingHoursChange(index, "open", e.target.value)}
                      className="w-32"
                    />
                    <span className="text-gray-500">to</span>
                    <Input
                      type="time"
                      value={hours.close}
                      onChange={(e) => handleOperatingHoursChange(index, "close", e.target.value)}
                      className="w-32"
                    />
                  </div>
                ))}
              </div>
            </div>
          </ComponentCard>

          <ComponentCard title="Document Requirements - MANDATORY" className="border-2 border-red-500 bg-red-50">
            <div className="space-y-4">
              <div className="bg-red-100 border border-red-400 rounded-lg p-4">
                <p className="text-sm font-semibold text-red-800 mb-3">
                  🔒 IMPORTANT - You CANNOT proceed without confirming you have these documents:
                </p>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1 mb-4">
                  <li>Business Registration (DTI/SEC)</li>
                  <li>Mayor's Permit / Business Permit</li>
                  <li>BIR Certificate of Registration (COR)</li>
                  <li>Valid ID of Business Owner</li>
                </ul>
                <p className="text-xs text-red-600 font-semibold mb-3">
                  ⚠️ All documents MUST be original, clear, and authentic. Fraudulent documents will result in immediate rejection and account suspension.
                </p>
              </div>

              <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                <input
                  type="checkbox"
                  id="agreesToRequirements"
                  checked={agreesToRequirements}
                  onChange={(e) => setAgreesToRequirements(e.target.checked)}
                  className="w-5 h-5 mt-1 cursor-pointer accent-green-500"
                />
                <label htmlFor="agreesToRequirements" className="text-sm text-gray-700 cursor-pointer flex-1">
                  <span className="font-semibold text-red-600">
                    ✓ I CONFIRM AND CERTIFY that I have ALL the required business permits, valid ID, and all documents are authentic and original.
                  </span>
                  <p className="text-xs text-gray-600 mt-2">
                    I understand that submitting false or fraudulent documents may result in rejection, account suspension, and potential legal action.
                  </p>
                </label>
              </div>
            </div>
          </ComponentCard>

          <div className="text-center mt-12">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={!agreesToRequirements || isSubmitting}
              className={`inline-block px-10 py-4 font-semibold uppercase tracking-wider text-sm transition-all duration-300 transform ${
                agreesToRequirements && !isSubmitting
                  ? 'bg-black text-white hover:bg-black/80 hover:scale-105 cursor-pointer'
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
              }`}
            >
              {isSubmitting ? 'Submitting...' : agreesToRequirements ? 'Submit Registration' : 'Confirm Requirements Above to Submit'}
            </button>
            {!agreesToRequirements && (
              <p className="text-red-600 text-sm mt-3 font-semibold">
                ⚠️ You must confirm you have all required documents before submitting
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
