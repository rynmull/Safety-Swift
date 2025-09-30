import 'next-auth';
import 'next-auth/jwt';

type OrgRole = 'OWNER' | 'MANAGER' | 'WORKER';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user?: {
      id: string;
      email: string;
      name?: string | null;
      locale: 'en' | 'es';
      orgs: { id: string; name: string; role: OrgRole }[];
    };
  }

  interface User {
    locale: 'en' | 'es';
    orgs: { id: string; name: string; role: OrgRole }[];
    token: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    user?: Session['user'];
  }
}
