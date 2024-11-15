import { BadRequestException } from '@nestjs/common';
import 'dotenv/config';
import * as joi from 'joi';

interface IEnvs {
  PORT: number;
  DATABASE_URL: string;
}

const envsSchema = joi
  .object<IEnvs>({
    PORT: joi.number().required(),
    DATABASE_URL: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate(process.env);

if (error) {
  throw new BadRequestException(error.message);
}

const envVars: IEnvs = value;

export const envs = {
  PORT: envVars.PORT,
  DATABASE_URL: envVars.DATABASE_URL,
};
