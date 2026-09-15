<?php

namespace Tests\Feature;

use App\Services\SiplahParserService;
use App\Services\TaxCalculationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SiplahAccountingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_dashboard_screen_can_be_rendered(): void
    {
        $response = $this->get('/dashboard');
        $response->assertStatus(200);
    }

    public function test_orders_screen_can_be_rendered(): void
    {
        $response = $this->get('/orders');
        $response->assertStatus(200);
    }

    public function test_customers_screen_can_be_rendered(): void
    {
        $response = $this->get('/customers');
        $response->assertStatus(200);
    }

    public function test_reports_screens_can_be_rendered(): void
    {
        $this->get('/reports/sales')->assertStatus(200);
        $this->get('/reports/margin')->assertStatus(200);
        $this->get('/reports/cash-flow')->assertStatus(200);
        $this->get('/reports/tax')->assertStatus(200);
        $this->get('/reconciliation')->assertStatus(200);
    }

    public function test_siplah_template_download(): void
    {
        $response = $this->get('/import/template');
        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }

    public function test_siplah_parser_service_on_sample_file(): void
    {
        $taxService = new TaxCalculationService;
        $parser = new SiplahParserService($taxService);
        $filePath = base_path('sample_data/template_siplah_cv_tihani.xlsx');

        $this->assertFileExists($filePath);

        // Preview
        $preview = $parser->preview($filePath);
        $this->assertGreaterThan(0, $preview['total_rows']);
        $this->assertGreaterThan(0, $preview['valid_count']);
        $this->assertGreaterThan(0, $preview['total_bruto']);

        // Import
        $importResult = $parser->import($filePath);
        $this->assertTrue($importResult['success']);
        $this->assertGreaterThan(0, $importResult['success_count']);
    }

    public function test_customer_creation(): void
    {
        $response = $this->post('/customers', [
            'name' => 'SMP Negeri 45 Bandung Baru',
            'npsn' => '20219999',
            'address' => 'Jl. Cibiru No. 10, Bandung',
            'contact_person' => 'Bpk. Hendra',
            'phone' => '081234567890',
            'npwp' => '00.999.888.7-428.000',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('customers', [
            'name' => 'SMP Negeri 45 Bandung Baru',
            'npsn' => '20219999',
        ]);
    }

    public function test_export_excel_sales_report(): void
    {
        $response = $this->get('/reports/export/excel?type=sales');
        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }
}
