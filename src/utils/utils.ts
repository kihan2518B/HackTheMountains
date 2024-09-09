export function isTokenExpired(token: string): boolean {
    try {
      const { exp } = JSON.parse(atob(token.split('.')[1]));
      return exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

export function getUserRoleFromToken(token: string): string {
    try {
      const { role } = JSON.parse(atob(token.split('.')[1])); // tacking role from the token
      return role;
    } catch {
      return ''; 
    }
  }

  export function getUserIdFromToken(token: string): string {
    try {
      const { id } = JSON.parse(atob(token.split('.')[1])); // tacking id from the token
      return id; 
    } catch {
      return '';
    }
  }