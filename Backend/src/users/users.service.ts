import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(email: string, pass: string, nickname: string) {
  const existingEmail = await this.userRepository.findOneBy({ email });
  if (existingEmail) throw new BadRequestException('Email уже зайнятий');

  const existingNick = await this.userRepository.findOneBy({ nickname });
  if (existingNick) throw new BadRequestException('Нікнейм уже зайнятий');

  const hashedPassword = await bcrypt.hash(pass, 10);

  const user = this.userRepository.create({ 
    email, 
    password: hashedPassword, 
    nickname 
  });
  
  return await this.userRepository.save(user);
}

  async findByEmail(email: string) {
  return await this.userRepository.findOne({ 
    where: { email }, 
    select: ['id', 'email', 'password', 'nickname'] 
  });
}
  
}