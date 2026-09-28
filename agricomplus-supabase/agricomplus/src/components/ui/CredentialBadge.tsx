import React from 'react';
import { ShieldCheck, Leaf, Award, CheckCircle, QrCode } from 'lucide-react';
import { Credential } from '../../types';

interface CredentialBadgeProps {
  credential: Credential;
  variant?: 'compact' | 'detailed';
}

export const CredentialBadge: React.FC<CredentialBadgeProps> = ({
  credential,
  variant = 'compact',
}) => {
  const getIcon = () => {
    switch (credential.icon) {
      case 'Leaf':
        return <Leaf className="w-3.5 h-3.5 text-[#3A7D44]" />;
      case 'Award':
        return <Award className="w-3.5 h-3.5 text-amber-600" />;
      case 'CheckCircle':
        return <CheckCircle className="w-3.5 h-3.5 text-[#234D33]" />;
      case 'QrCode':
        return <QrCode className="w-3.5 h-3.5 text-[#234D33]" />;
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-[#234D33]" />;
    }
  };

  if (variant === 'detailed') {
    return (
      <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-left">
        <div className="p-1.5 rounded-lg bg-white shadow-xs shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-stone-900 leading-tight">
            {credential.label}
          </p>
          <p className="text-[11px] text-stone-500 truncate mt-0.5">
            {credential.issuer}
          </p>
          <p className="text-[10px] text-[#3A7D44] font-medium mt-0.5">
            Verified: {credential.verifiedDate}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/70 text-stone-800 text-xs font-medium shrink-0">
      {getIcon()}
      <span>{credential.label}</span>
    </div>
  );
};
