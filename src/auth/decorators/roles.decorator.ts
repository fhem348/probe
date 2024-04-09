import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/user/types/user-role.type';
//roles 데코레이터
//SetMetadata 함수를 사용하여 메타데이터를 설정하고, ROLES_KEY 상수를 사용하여 메타데이터의 키를 정의합니다. 이후 Roles 데코레이터는 여러 역할을 매개변수로 받아서 해당 역할을 메타데이터에 설정합니다.
export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
