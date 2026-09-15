<?php

namespace Tests\Unit;

use App\Services\TaxCalculationService;
use PHPUnit\Framework\TestCase;

class TaxCalculationTest extends TestCase
{
    protected TaxCalculationService $taxService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->taxService = new TaxCalculationService;
    }

    public function test_pph22_is_zero_when_below_threshold(): void
    {
        // Transaksi di bawah Rp 2.000.000 tidak dikenakan pemotongan PPh 22
        $bruto = 1500000;
        $pph22 = $this->taxService->calculatePPh22($bruto, hasNpwp: true, forceThreshold: true);
        $this->assertEquals(0.0, $pph22);
    }

    public function test_pph22_calculated_at_1_point_5_percent_with_npwp(): void
    {
        // Transaksi Rp 4.500.000 -> 1.5% = Rp 67.500
        $bruto = 4500000;
        $pph22 = $this->taxService->calculatePPh22($bruto, hasNpwp: true);
        $this->assertEquals(67500.0, $pph22);
    }

    public function test_pph22_calculated_at_3_percent_without_npwp(): void
    {
        // Transaksi Rp 4.500.000 tanpa NPWP -> 3.0% = Rp 135.000
        $bruto = 4500000;
        $pph22 = $this->taxService->calculatePPh22($bruto, hasNpwp: false);
        $this->assertEquals(135000.0, $pph22);
    }

    public function test_ppn_calculated_at_11_percent(): void
    {
        // Transaksi Rp 4.500.000 -> 11% = Rp 495.000
        $bruto = 4500000;
        $ppn = $this->taxService->calculatePPN($bruto);
        $this->assertEquals(495000.0, $ppn);
    }

    public function test_gross_profit_and_margin_percentage(): void
    {
        // Bruto Rp 8.500.000, Belanja Modal Rp 6.800.000 -> Laba Kotor Rp 1.700.000 (20%)
        $bruto = 8500000;
        $modal = 6800000;
        $profit = $this->taxService->calculateGrossProfit($bruto, $modal);
        $margin = $this->taxService->calculateMarginPercentage($profit, $bruto);

        $this->assertEquals(1700000.0, $profit);
        $this->assertEquals(20.0, $margin);
    }

    public function test_net_disbursement_calculation(): void
    {
        // Bruto: 4.500.000, PPh 22: 67.500, PPN: 495.000, Admin: 25.000, VA: 3.500
        // Net = 4.500.000 - 591.000 = 3.909.000
        $net = $this->taxService->calculateNetDisbursement(4500000, 67500, 495000, 25000, 3500);
        $this->assertEquals(3909000.0, $net);
    }
}
