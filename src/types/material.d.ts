import * as React from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'md-filled-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { disabled?: boolean; class?: string; slot?: string };
      'md-fab': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        variant?: 'surface' | 'primary' | 'secondary' | 'tertiary';
        size?: 'small' | 'medium' | 'large';
        label?: string;
        disabled?: boolean;
        class?: string;
        slot?: string;
      };
      'md-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & { class?: string; slot?: string };
      'md-icon-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        disabled?: boolean;
        class?: string;
        slot?: string;
      };
      'md-circular-progress': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        indeterminate?: boolean;
        value?: number;
        class?: string;
        slot?: string;
      };
      'md-assist-chip': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        label?: string;
        disabled?: boolean;
        class?: string;
        slot?: string;
      };
      'md-list': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        class?: string;
        slot?: string;
      };
      'md-list-item': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        type?: 'text' | 'button' | 'link';
        disabled?: boolean;
        class?: string;
        slot?: string;
      };
      'md-elevation': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        level?: number | string;
        class?: string;
        slot?: string;
      };
    }
  }
}
