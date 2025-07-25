import { isPlatformBrowser } from '@angular/common';
import { DOCUMENT, inject, Injectable, PLATFORM_ID, REQUEST } from '@angular/core';
import { Request } from 'express';

@Injectable({
  providedIn: 'root'
})
export class SsrCookieService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly request: Request | null = <Request | null>inject(REQUEST);
  private readonly documentIsAccessible: boolean = isPlatformBrowser(this.platformId);

  /**
   * Get cookie Regular Expression
   *
   * @param name Cookie name
   * @returns property RegExp
   */
  static getCookieRegExp(name: string): RegExp {
    const escapedName: string = name.replace(/([\[\]{}()|=;+?,.*^$])/gi, '\\$1');

    return new RegExp('(?:^' + escapedName + '|;\\s*' + escapedName + ')=(.*?)(?:;|$)', 'g');
  }

  /**
   * Gets the unencoded version of an encoded component of a Uniform Resource Identifier (URI).
   *
   * @param encodedURIComponent A value representing an encoded URI component.
   *
   * @returns The unencoded version of an encoded component of a Uniform Resource Identifier (URI).
   */
  static safeDecodeURIComponent(encodedURIComponent: string): string {
    try {
      return decodeURIComponent(encodedURIComponent);
    } catch {
      // probably it is not uri encoded. return as is
      return encodedURIComponent;
    }
  }

  getHeaderCookie() {
    return this.request ? (this.request.headers as any).get('cookie') : '';
  }

  getCookie() {
    return (this.documentIsAccessible ? this.document.cookie : this.getHeaderCookie()) || '';
  }

  /**
   * Return `true` if {@link Document} is accessible, otherwise return `false`
   *
   * @param name Cookie name
   * @returns boolean - whether cookie with specified name exists
   */
  check(name: string): boolean {
    name = encodeURIComponent(name);
    const regExp: RegExp = SsrCookieService.getCookieRegExp(name);
    return regExp.test(this.getCookie());
  }

  /**
   * Get cookies by name
   *
   * @param name Cookie name
   * @returns property value
   */
  get(name: string): string {
    if (this.check(name)) {
      name = encodeURIComponent(name);

      const regExp: RegExp = SsrCookieService.getCookieRegExp(name);
      const result: RegExpExecArray | null = regExp.exec(this.getCookie());

      return result && result[1] ? SsrCookieService.safeDecodeURIComponent(result[1]) : '';
    } else {
      return '';
    }
  }

  /**
   * Get all cookies in JSON format
   *
   * @returns all the cookies in json
   */
  getAll(): { [key: string]: string } {
    const cookies: { [key: string]: string } = {};
    const cookieString: any = this.documentIsAccessible ? this.document?.cookie : this.request?.headers.cookie;

    if (cookieString && cookieString !== '') {
      cookieString.split(';').forEach((currentCookie: { split: (arg0: string) => [any, any] }) => {
        const [cookieName, cookieValue] = currentCookie.split('=');
        cookies[SsrCookieService.safeDecodeURIComponent(cookieName.replace(/^ /, ''))] =
          SsrCookieService.safeDecodeURIComponent(cookieValue);
      });
    }

    return cookies;
  }

  /**
   * Set cookie based on provided information
   *
   * @param name     Cookie name
   * @param value    Cookie value
   * @param expires  Number of days until the cookies expires or an actual `Date`
   * @param path     Cookie path
   * @param domain   Cookie domain
   * @param secure   Secure flag
   * @param sameSite OWASP same site token `Lax`, `None`, or `Strict`. Defaults to `Lax`
   * @param partitioned Partitioned flag
   */
  set(
    name: string,
    value: string,
    expires?: number | Date,
    path?: string,
    domain?: string,
    secure?: boolean,
    sameSite?: 'Lax' | 'None' | 'Strict',
    partitioned?: boolean
  ): void;

  /**
   * Set cookie based on provided information
   *
   * Cookie's parameters:
   * <pre>
   * expires  Number of days until the cookies expires or an actual `Date`
   * path     Cookie path
   * domain   Cookie domain
   * secure Cookie secure flag
   * sameSite OWASP same site token `Lax`, `None`, or `Strict`. Defaults to `Lax`
   * </pre>
   *
   * @param name     Cookie name
   * @param value    Cookie value
   * @param options  Body with cookie's params
   */
  set(
    name: string,
    value: string,
    options?: {
      expires?: number | Date;
      path?: string;
      domain?: string;
      secure?: boolean;
      sameSite?: 'Lax' | 'None' | 'Strict';
      partitioned?: boolean;
    }
  ): void;

  set(
    name: string,
    value: string,
    expiresOrOptions?: number | Date | any,
    path?: string,
    domain?: string,
    secure?: boolean,
    sameSite?: 'Lax' | 'None' | 'Strict',
    partitioned?: boolean
  ): void {
    if (!this.documentIsAccessible) {
      return;
    }

    if (
      typeof expiresOrOptions === 'number' ||
      expiresOrOptions instanceof Date ||
      path ||
      domain ||
      secure ||
      sameSite
    ) {
      const optionsBody = {
        expires: expiresOrOptions,
        path,
        domain,
        secure,
        sameSite: sameSite ? sameSite : 'Lax',
        partitioned
      };

      this.set(name, value, optionsBody);
      return;
    }

    let cookieString: string = encodeURIComponent(name) + '=' + encodeURIComponent(value) + ';';

    const options = expiresOrOptions ? expiresOrOptions : {};

    if (options.expires) {
      if (typeof options.expires === 'number') {
        const dateExpires: Date = new Date(new Date().getTime() + options.expires * 1000 * 60 * 60 * 24);

        cookieString += 'expires=' + dateExpires.toUTCString() + ';';
      } else {
        cookieString += 'expires=' + options.expires.toUTCString() + ';';
      }
    }

    if (options.path) {
      cookieString += 'path=' + options.path + ';';
    }

    if (options.domain) {
      cookieString += 'domain=' + options.domain + ';';
    }

    if (options.secure === false && options.sameSite === 'None') {
      options.secure = true;
      console.warn(
        `Cookie ${name} was forced with secure flag because sameSite=None.` +
          `More details : https://github.com/stevermeister/ngx-cookie-service/issues/86#issuecomment-597720130`
      );
    }
    if (options.secure) {
      cookieString += 'secure;';
    }

    if (!options.sameSite) {
      options.sameSite = 'Lax';
    }

    cookieString += 'sameSite=' + options.sameSite + ';';

    if (options.partitioned) {
      cookieString += 'Partitioned;';
    }

    this.document.cookie = cookieString;
  }

  /**
   * Delete cookie by name
   *
   * @param name   Cookie name
   * @param path   Cookie path
   * @param domain Cookie domain
   * @param secure Cookie secure flag
   * @param sameSite Cookie sameSite flag - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
   */
  delete(
    name: string,
    path?: string,
    domain?: string,
    secure?: boolean,
    sameSite: 'Lax' | 'None' | 'Strict' = 'Lax'
  ): void {
    if (!this.documentIsAccessible) {
      return;
    }
    const expiresDate = new Date('Thu, 01 Jan 1970 00:00:01 GMT');
    this.set(name, '', { expires: expiresDate, path, domain, secure, sameSite });
  }

  /**
   * Delete all cookies
   *
   * @param path   Cookie path
   * @param domain Cookie domain
   * @param secure Is the Cookie secure
   * @param sameSite Is the cookie same site
   */
  deleteAll(path?: string, domain?: string, secure?: boolean, sameSite: 'Lax' | 'None' | 'Strict' = 'Lax'): void {
    if (!this.documentIsAccessible) {
      return;
    }

    const cookies: any = this.getAll();

    for (const cookieName in cookies) {
      if (cookies.hasOwnProperty(cookieName)) {
        this.delete(cookieName, path, domain, secure, sameSite);
      }
    }
  }
}
