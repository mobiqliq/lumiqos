import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Onboarding.module.css';

const STEPS = ['School Details', 'Admin Account', 'Plan & Billing', 'Review'];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    schoolName: '',
    subdomain: '',
    address: '',
    adminEmail: '',
    adminFirstName: '',
    adminLastName: '',
    adminPhone: '',
    plan: 'starter',
    billingCycle: 'monthly',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      alert(`School "${formData.schoolName}" onboarded successfully!`);
      navigate('/schools');
    }, 1500);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className={styles.stepContent}>
            <div className={styles.formGroup}>
              <label>School Name *</label>
              <input
                type="text"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleChange}
                placeholder="e.g., Greenfield Academy"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Subdomain *</label>
              <div className={styles.subdomainWrapper}>
                <input
                  type="text"
                  name="subdomain"
                  value={formData.subdomain}
                  onChange={handleChange}
                  placeholder="greenfield"
                  required
                />
                <span className={styles.subdomainSuffix}>.lumiqos.io</span>
              </div>
              <p className={styles.helperText}>This will be your school's unique URL.</p>
            </div>
            <div className={styles.formGroup}>
              <label>Address (Optional)</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="School address..."
                rows={2}
              />
            </div>
          </div>
        );
      case 1:
        return (
          <div className={styles.stepContent}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>First Name *</label>
                <input
                  type="text"
                  name="adminFirstName"
                  value={formData.adminFirstName}
                  onChange={handleChange}
                  placeholder="John"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Last Name *</label>
                <input
                  type="text"
                  name="adminLastName"
                  value={formData.adminLastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>Email Address *</label>
              <input
                type="email"
                name="adminEmail"
                value={formData.adminEmail}
                onChange={handleChange}
                placeholder="admin@school.com"
                required
              />
              <p className={styles.helperText}>Initial admin account credentials will be sent here.</p>
            </div>
            <div className={styles.formGroup}>
              <label>Phone (Optional)</label>
              <input
                type="tel"
                name="adminPhone"
                value={formData.adminPhone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className={styles.stepContent}>
            <div className={styles.formGroup}>
              <label>Select Plan *</label>
              <div className={styles.planOptions}>
                {['starter', 'premium', 'enterprise'].map((plan) => (
                  <label key={plan} className={`${styles.planCard} ${formData.plan === plan ? styles.planCardSelected : ''}`}>
                    <input
                      type="radio"
                      name="plan"
                      value={plan}
                      checked={formData.plan === plan}
                      onChange={handleChange}
                    />
                    <div className={styles.planInfo}>
                      <span className={styles.planName}>{plan.charAt(0).toUpperCase() + plan.slice(1)}</span>
                      <span className={styles.planPrice}>
                        {plan === 'starter' ? '₹4,999/mo' : plan === 'premium' ? '₹12,999/mo' : 'Custom'}
                      </span>
                      <span className={styles.planDesc}>
                        {plan === 'starter' && 'Up to 500 students'}
                        {plan === 'premium' && 'Up to 2,000 students + AI insights'}
                        {plan === 'enterprise' && 'Unlimited + dedicated support'}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>Billing Cycle</label>
              <div className={styles.billingOptions}>
                <label className={`${styles.billingOption} ${formData.billingCycle === 'monthly' ? styles.billingOptionSelected : ''}`}>
                  <input
                    type="radio"
                    name="billingCycle"
                    value="monthly"
                    checked={formData.billingCycle === 'monthly'}
                    onChange={handleChange}
                  />
                  Monthly
                </label>
                <label className={`${styles.billingOption} ${formData.billingCycle === 'yearly' ? styles.billingOptionSelected : ''}`}>
                  <input
                    type="radio"
                    name="billingCycle"
                    value="yearly"
                    checked={formData.billingCycle === 'yearly'}
                    onChange={handleChange}
                  />
                  Yearly (Save 20%)
                </label>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className={styles.stepContent}>
            <div className={styles.reviewSection}>
              <h3>School Details</h3>
              <p><strong>Name:</strong> {formData.schoolName || '—'}</p>
              <p><strong>Subdomain:</strong> {formData.subdomain ? `${formData.subdomain}.lumiqos.io` : '—'}</p>
              <p><strong>Address:</strong> {formData.address || '—'}</p>
            </div>
            <div className={styles.reviewSection}>
              <h3>Admin Account</h3>
              <p><strong>Name:</strong> {formData.adminFirstName} {formData.adminLastName}</p>
              <p><strong>Email:</strong> {formData.adminEmail}</p>
              <p><strong>Phone:</strong> {formData.adminPhone || '—'}</p>
            </div>
            <div className={styles.reviewSection}>
              <h3>Plan & Billing</h3>
              <p><strong>Plan:</strong> {formData.plan.charAt(0).toUpperCase() + formData.plan.slice(1)}</p>
              <p><strong>Billing:</strong> {formData.billingCycle.charAt(0).toUpperCase() + formData.billingCycle.slice(1)}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const isStepValid = () => {
    if (currentStep === 0) return formData.schoolName && formData.subdomain;
    if (currentStep === 1) return formData.adminFirstName && formData.adminLastName && formData.adminEmail;
    return true;
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Onboard New School</h1>
        <p className={styles.pageSubtitle}>Provision a new tenant with all necessary configurations</p>
      </div>

      <div className={styles.card}>
        {/* Step Indicator */}
        <div className={styles.stepIndicator}>
          {STEPS.map((step, idx) => (
            <div key={idx} className={`${styles.step} ${idx === currentStep ? styles.active : ''} ${idx < currentStep ? styles.completed : ''}`}>
              <span className={styles.stepNumber}>{idx + 1}</span>
              <span className={styles.stepLabel}>{step}</span>
            </div>
          ))}
        </div>

        <form onSubmit={currentStep === STEPS.length - 1 ? handleSubmit : (e) => e.preventDefault()}>
          {renderStepContent()}

          <div className={styles.formActions}>
            {currentStep > 0 && (
              <button type="button" className={styles.secondaryButton} onClick={handleBack}>
                Back
              </button>
            )}
            {currentStep < STEPS.length - 1 ? (
              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleNext}
                disabled={!isStepValid()}
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={isSubmitting || !isStepValid()}
              >
                {isSubmitting ? 'Provisioning...' : 'Complete Onboarding'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
