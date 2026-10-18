'use client';

import { useContext } from 'react';

import { Turnstile, TurnstileProps } from '@marsidev/react-turnstile';

import { Captcha } from './captcha-provider';

export function CaptchaTokenSetter(props: {
  siteKey?: string;
  options?: TurnstileProps;
  className?: string;
}) {
  const { setToken, setInstance } = useContext(Captcha);
  const siteKey =
    props.siteKey || process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY;

  if (!siteKey) {
    return null;
  }

  const defaultOptions: TurnstileProps = {
    options: {
      size: 'normal',
      theme: 'auto',
    },
  };

  const options = props.options ?? defaultOptions;

  return (
    <div className={props.className ?? 'flex justify-center my-3'}>
      <Turnstile
        ref={(instance) => {
          if (instance) {
            setInstance(instance);
          }
        }}
        siteKey={siteKey}
        onSuccess={setToken}
        onExpire={() => setToken('')}
        onError={() => setToken('')}
        {...options}
      />
    </div>
  );
}
