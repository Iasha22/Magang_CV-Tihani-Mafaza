<?php

namespace App\Services;

class TaxCalculationService
{
    /**
     * Threshold nilai pengadaan belanja BOS untuk pemotongan PPh 22 (Rp 2.000.000)
     */
    public const PPH22_THRESHOLD = 2000000;

    /**
     * Tarif PPh 22 standar untuk rekanan ber-NPWP (1.5%)
     */
    public const PPH22_RATE_WITH_NPWP = 0.015;

    /**
     * Tarif PPh 22 untuk rekanan tanpa NPWP (3.0%)
     */
    public const PPH22_RATE_WITHOUT_NPWP = 0.03;

    /**
     * Tarif PPN standar (11%)
     */
    public const PPN_RATE = 0.11;

    /**
     * Hitung PPh Pasal 22
     *
     * @param  float  $bruto  Nilai transaksi bruto (sebelum PPN)
     * @param  bool  $hasNpwp  Apakah rekanan memiliki NPWP
     * @param  bool  $forceThreshold  Apakah memeriksa batas threshold Rp 2.000.000
     */
    public function calculatePPh22(float $bruto, bool $hasNpwp = true, bool $forceThreshold = true): float
    {
        if ($forceThreshold && $bruto < self::PPH22_THRESHOLD) {
            return 0.0;
        }

        $rate = $hasNpwp ? self::PPH22_RATE_WITH_NPWP : self::PPH22_RATE_WITHOUT_NPWP;

        return round($bruto * $rate, 2);
    }

    /**
     * Hitung PPN
     *
     * @param  float  $bruto  Nilai transaksi bruto
     * @param  float  $rate  Tarif PPN (default 11%)
     */
    public function calculatePPN(float $bruto, float $rate = self::PPN_RATE): float
    {
        return round($bruto * $rate, 2);
    }

    /**
     * Hitung Nilai Bersih Pencairan Dana ke Rekening CV (Net Disbursement)
     * Net = Bruto - (PPh 22 + PPN + Biaya Admin + Biaya VA)
     */
    public function calculateNetDisbursement(
        float $bruto,
        float $pph22,
        float $ppn,
        float $adminFee = 0.0,
        float $vaFee = 0.0
    ): float {
        $net = $bruto - ($pph22 + $ppn + $adminFee + $vaFee);

        return round(max(0, $net), 2);
    }

    /**
     * Hitung Laba Kotor (Gross Profit)
     * Laba Kotor = Nilai Bruto - Belanja Modal (HPP)
     */
    public function calculateGrossProfit(float $bruto, float $belanjaModal): float
    {
        return round($bruto - $belanjaModal, 2);
    }

    /**
     * Hitung Persentase Margin Laba Kotor (%)
     * Margin % = (Laba Kotor / Bruto) * 100
     */
    public function calculateMarginPercentage(float $grossProfit, float $bruto): float
    {
        if ($bruto <= 0) {
            return 0.0;
        }

        return round(($grossProfit / $bruto) * 100, 2);
    }

    /**
     * Kalkulasi komprehensif untuk satu transaksi pesanan
     */
    public function calculateAll(float $bruto, float $belanjaModal, bool $hasNpwp = true, float $adminFee = 0.0, float $vaFee = 0.0): array
    {
        $pph22 = $this->calculatePPh22($bruto, $hasNpwp);
        $ppn = $this->calculatePPN($bruto);
        $netDisbursement = $this->calculateNetDisbursement($bruto, $pph22, $ppn, $adminFee, $vaFee);
        $grossProfit = $this->calculateGrossProfit($bruto, $belanjaModal);
        $marginPercentage = $this->calculateMarginPercentage($grossProfit, $bruto);

        return [
            'bruto' => $bruto,
            'belanja_modal' => $belanjaModal,
            'pph22' => $pph22,
            'ppn' => $ppn,
            'admin_fee' => $adminFee,
            'va_fee' => $vaFee,
            'total_deductions' => round($pph22 + $ppn + $adminFee + $vaFee, 2),
            'net_disbursement' => $netDisbursement,
            'gross_profit' => $grossProfit,
            'margin_percentage' => $marginPercentage,
        ];
    }
}
