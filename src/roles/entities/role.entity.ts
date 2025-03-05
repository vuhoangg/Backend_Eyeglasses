import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany,
    JoinTable,
  } from 'typeorm';
//   import { User } from 'src/users/entities/user.entity';
import { Permission } from 'src/permissions/entities/permission.entity';
import { User } from 'src/user/entities/user.entity';
  
  @Entity('roles')
  export class Role {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ unique: true })
    name: string;
  
    @Column({ nullable: true })
    description?: string;
  
    @ManyToMany(() => User, (user) => user.roles)
    users: User[];

    @ManyToMany(() => Role, (role) => role.users)
    @JoinTable()
    roles: Role[];
  
    @ManyToMany(() => Permission, (permission) => permission.roles)
    @JoinTable({
      name: 'role_permissions',
      joinColumn: {
        name: 'role_id',
        referencedColumnName: 'id',
      },
      inverseJoinColumn: {
        name: 'permission_id',
        referencedColumnName: 'id',
      },
    })
    permissions: Permission[];
  }
