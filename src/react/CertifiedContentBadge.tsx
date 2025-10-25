
import React, { useState, useEffect, useRef } from 'react';
import { VerificationState, buildVerificationUrl, decodeUserSecret, fetchData } from '../core';

interface CertifiedContentBadgeProps {
  genContentId: string;
  userSecret?: string;
  proxyUrl?: string;
}

const CertifiedContentBadge: React.FC<CertifiedContentBadgeProps> = ({
  genContentId,
  userSecret,
  proxyUrl,
}) => {
  const [verificationState, setVerificationState] = useState<VerificationState>(
    VerificationState.LOADING
  );
  const [error, setError] = useState<string | null>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const verifyContent = async () => {
      setVerificationState(VerificationState.LOADING);
      let finalUserSecret = userSecret;

      try {
        if (proxyUrl) {
          // Secure Proxy Method
          const response = await fetchData(`${proxyUrl}?genContentId=${genContentId}`);
          if (response.verified) {
            setVerificationState(VerificationState.CERTIFIED);
          } else {
            setVerificationState(VerificationState.UNCERTIFIED);
          }
        } else {
          // Obfuscated Key Method
          if (!finalUserSecret) {
            // Look for data-cc-secret on parent elements
            let parent = badgeRef.current?.parentElement;
            while (parent) {
              if (parent.dataset.ccSecret) {
                finalUserSecret = parent.dataset.ccSecret;
                break;
              }
              parent = parent.parentElement;
            }
          }

          if (!finalUserSecret) {
            throw new Error('userSecret prop or data-cc-secret attribute is required.');
          }

          const decodedKey = decodeUserSecret(finalUserSecret);
          const verificationUrl = buildVerificationUrl(genContentId, decodedKey);
          const response = await fetchData(verificationUrl);

          if (response.verified) {
            setVerificationState(VerificationState.CERTIFIED);
          } else {
            setVerificationState(VerificationState.UNCERTIFIED);
          }
        }
      } catch (err: any) {
        setError(err.message);
        setVerificationState(VerificationState.ERROR);
      }
    };

    verifyContent();
  }, [genContentId, userSecret, proxyUrl]);

  return (
    <div ref={badgeRef}>
      {verificationState === VerificationState.LOADING && <span>Loading...</span>}
      {verificationState === VerificationState.CERTIFIED && <span>Content Certified</span>}
      {verificationState === VerificationState.UNCERTIFIED && <span>Content Not Certified</span>}
      {verificationState === VerificationState.ERROR && <span>Error: {error}</span>}
    </div>
  );
};

export default CertifiedContentBadge;
