export function generateRandomOTP(length: number): number {
    let otp: string = '';

    for (let i = 0; i < length; i++) {
        // Tạo số ngẫu nhiên từ 0 đến 9
        const randomDigit: number = Math.floor(Math.random() * 10);
        otp += randomDigit.toString();
    }

    return Number(otp);
}
