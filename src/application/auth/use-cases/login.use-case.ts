import { AuthUserReaderPort } from '../ports/auth-user-reader.port';
import { PasswordHasherPort } from '../ports/password-hasher.port';
import { TokenSignerPort } from '../ports/token-signer.port';

export class InvalidCredentialsError extends Error {}
export class InactiveUserError extends Error {}

export interface LoginOutput {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    tenantId: string;
  };
}

export class LoginUseCase {
  constructor(
    private readonly userReader: AuthUserReaderPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly tokenSigner: TokenSignerPort,
  ) {}

  async execute(email: string, password: string): Promise<LoginOutput> {
    const user = await this.userReader.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsError('Email no encontrado');
    }

    if (!user.active) {
      throw new InactiveUserError('Usuario desactivado');
    }

    const passwordValid = await this.passwordHasher.compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new InvalidCredentialsError('Contrasena incorrecta');
    }

    const accessToken = this.tokenSigner.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    });

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }
}
