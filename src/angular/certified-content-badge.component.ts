
import { Component, Input, OnInit, signal, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VerificationState, buildVerificationUrl, decodeUserSecret, fetchData } from '../core';

@Component({
  selector: 'certified-content-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      @switch (verificationState()) {
        @case (VerificationState.LOADING) {
          <span>Loading...</span>
        }
        @case (VerificationState.CERTIFIED) {
          <span>Content Certified</span>
        }
        @case (VerificationState.UNCERTIFIED) {
          <span>Content Not Certified</span>
        }
        @case (VerificationState.ERROR) {
          <span>Error: {{ error() }}</span>
        }
      }
    </div>
  `,
})
export class CertifiedContentBadge implements OnInit {
  @Input() genContentId!: string;
  @Input() userSecret?: string;
  @Input() proxyUrl?: string;

  verificationState = signal<VerificationState>(VerificationState.LOADING);
  error = signal<string | null>(null);
  VerificationState = VerificationState; // Expose enum to template

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.verifyContent();
  }

  async verifyContent(): Promise<void> {
    this.verificationState.set(VerificationState.LOADING);
    let finalUserSecret = this.userSecret;

    try {
      if (this.proxyUrl) {
        // Secure Proxy Method
        const response = await fetchData(`${this.proxyUrl}?genContentId=${this.genContentId}`);
        if (response.verified) {
          this.verificationState.set(VerificationState.CERTIFIED);
        } else {
          this.verificationState.set(VerificationState.UNCERTIFIED);
        }
      } else {
        // Obfuscated Key Method
        if (!finalUserSecret) {
          let parent = this.elementRef.nativeElement.parentElement;
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
        const verificationUrl = buildVerificationUrl(this.genContentId, decodedKey);
        const response = await fetchData(verificationUrl);

        if (response.verified) {
          this.verificationState.set(VerificationState.CERTIFIED);
        } else {
          this.verificationState.set(VerificationState.UNCERTIFIED);
        }
      }
    } catch (err: any) {
      this.error.set(err.message);
      this.verificationState.set(VerificationState.ERROR);
    }
  }
}
