import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@axemap/shared';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
