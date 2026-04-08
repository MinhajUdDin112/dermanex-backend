import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ScanBarcodeDto {
  @ApiProperty({
    example: '5054614916012',
    description: 'Product barcode to scan and analyze',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  barcode: string;
}
