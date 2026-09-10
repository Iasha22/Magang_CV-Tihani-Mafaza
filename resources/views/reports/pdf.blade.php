<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $title }} - CV Tihani Mafaza</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 11px;
            color: #1e293b;
            line-height: 1.4;
            margin: 0;
            padding: 10px;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 8px;
            margin-bottom: 15px;
        }
        .header h1 {
            font-size: 16px;
            margin: 0;
            color: #0f172a;
            text-transform: uppercase;
        }
        .header p {
            margin: 2px 0;
            font-size: 10px;
            color: #475569;
        }
        .report-title {
            font-size: 13px;
            font-weight: bold;
            margin-bottom: 10px;
            text-align: center;
            text-transform: uppercase;
            color: #1e3a8a;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #cbd5e1;
            padding: 6px 8px;
            font-size: 9px;
        }
        th {
            background-color: #f1f5f9;
            font-weight: bold;
            text-align: center;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .total-row {
            font-weight: bold;
            background-color: #f8fafc;
        }
        .signature-section {
            margin-top: 30px;
            width: 100%;
        }
        .sig-box {
            width: 45%;
            display: inline-block;
            text-align: center;
            vertical-align: top;
        }
        .sig-space {
            height: 60px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>CV TIHANI MAFAZA</h1>
        <p>Penyedia Pengadaan Barang & Jasa Sekolah (Mitra Resmi SIPLah Kemdikbudristek)</p>
        <p>Kota Bandung, Jawa Barat | Sistem Informasi Akuntansi Terintegrasi</p>
    </div>

    <div class="report-title">{{ $title }}</div>
    <div style="font-size: 9px; margin-bottom: 12px; color: #64748b;">
        Tanggal Cetak: {{ $date }} WIB
    </div>

    @if ($type === 'sales')
        <table>
            <thead>
                <tr>
                    <th width="4%">No</th>
                    <th width="15%">No Pesanan</th>
                    <th width="10%">Tanggal</th>
                    <th width="25%">Sekolah (Pelanggan)</th>
                    <th width="13%" class="text-right">Bruto (Rp)</th>
                    <th width="13%" class="text-right">HPP / Modal (Rp)</th>
                    <th width="12%" class="text-right">Laba Kotor (Rp)</th>
                    <th width="8%" class="text-center">Margin</th>
                </tr>
            </thead>
            <tbody>
                @php $totB = 0; $totC = 0; $totP = 0; @endphp
                @foreach ($data['orders'] as $i => $order)
                    @php 
                        $totB += $order->total_bruto; 
                        $totC += $order->total_cost; 
                        $totP += $order->gross_profit; 
                    @endphp
                    <tr>
                        <td class="text-center">{{ $i + 1 }}</td>
                        <td>{{ $order->siplah_order_id }}</td>
                        <td class="text-center">{{ $order->order_date->format('d/m/Y') }}</td>
                        <td>{{ $order->customer?->name }}</td>
                        <td class="text-right">{{ number_format($order->total_bruto, 0, ',', '.') }}</td>
                        <td class="text-right">{{ number_format($order->total_cost, 0, ',', '.') }}</td>
                        <td class="text-right">{{ number_format($order->gross_profit, 0, ',', '.') }}</td>
                        <td class="text-center">{{ $order->margin_percentage }}%</td>
                    </tr>
                @endforeach
                <tr class="total-row">
                    <td colspan="4" class="text-center">TOTAL KESELURUHAN</td>
                    <td class="text-right">Rp {{ number_format($totB, 0, ',', '.') }}</td>
                    <td class="text-right">Rp {{ number_format($totC, 0, ',', '.') }}</td>
                    <td class="text-right">Rp {{ number_format($totP, 0, ',', '.') }}</td>
                    <td class="text-center">{{ $totB > 0 ? round(($totP / $totB) * 100, 1) : 0 }}%</td>
                </tr>
            </tbody>
        </table>
    @elseif ($type === 'tax')
        <table>
            <thead>
                <tr>
                    <th width="4%">No</th>
                    <th width="15%">No Pesanan</th>
                    <th width="10%">Tanggal</th>
                    <th width="25%">Sekolah Pemungut</th>
                    <th width="14%" class="text-right">DPP Bruto (Rp)</th>
                    <th width="11%" class="text-right">PPh 22 (1.5%)</th>
                    <th width="11%" class="text-right">PPN (11%)</th>
                    <th width="10%" class="text-right">Total Pajak</th>
                </tr>
            </thead>
            <tbody>
                @php $totDpp = 0; $totPph = 0; $totPpn = 0; @endphp
                @foreach ($data['transactions'] as $i => $tx)
                    @php 
                        $totDpp += $tx->bruto; 
                        $totPph += $tx->tax_pph22; 
                        $totPpn += $tx->tax_ppn; 
                    @endphp
                    <tr>
                        <td class="text-center">{{ $i + 1 }}</td>
                        <td>{{ $tx->order?->siplah_order_id }}</td>
                        <td class="text-center">{{ $tx->transaction_date->format('d/m/Y') }}</td>
                        <td>{{ $tx->order?->customer?->name }}</td>
                        <td class="text-right">{{ number_format($tx->bruto, 0, ',', '.') }}</td>
                        <td class="text-right">{{ number_format($tx->tax_pph22, 0, ',', '.') }}</td>
                        <td class="text-right">{{ number_format($tx->tax_ppn, 0, ',', '.') }}</td>
                        <td class="text-right">{{ number_format($tx->tax_pph22 + $tx->tax_ppn, 0, ',', '.') }}</td>
                    </tr>
                @endforeach
                <tr class="total-row">
                    <td colspan="4" class="text-center">TOTAL REKAPITULASI PAJAK</td>
                    <td class="text-right">Rp {{ number_format($totDpp, 0, ',', '.') }}</td>
                    <td class="text-right">Rp {{ number_format($totPph, 0, ',', '.') }}</td>
                    <td class="text-right">Rp {{ number_format($totPpn, 0, ',', '.') }}</td>
                    <td class="text-right">Rp {{ number_format($totPph + $totPpn, 0, ',', '.') }}</td>
                </tr>
            </tbody>
        </table>
    @else
        <table>
            <thead>
                <tr>
                    <th width="4%">No</th>
                    <th width="15%">No Pesanan</th>
                    <th width="10%">Tanggal</th>
                    <th width="25%">Sekolah</th>
                    <th width="15%" class="text-right">Bruto (Rp)</th>
                    <th width="15%" class="text-right">Belanja Modal (Rp)</th>
                    <th width="16%" class="text-right">Net Cair (Rp)</th>
                </tr>
            </thead>
            <tbody>
                @if (isset($data['rows']))
                    @foreach ($data['rows'] as $i => $r)
                        <tr>
                            <td class="text-center">{{ $i + 1 }}</td>
                            <td>{{ $r['siplah_order_id'] }}</td>
                            <td class="text-center">{{ $r['order_date'] }}</td>
                            <td>{{ $r['school_name'] }}</td>
                            <td class="text-right">{{ number_format($r['bruto'], 0, ',', '.') }}</td>
                            <td class="text-right">{{ number_format($r['belanja_modal'], 0, ',', '.') }}</td>
                            <td class="text-right">{{ number_format($r['net_expected'], 0, ',', '.') }}</td>
                        </tr>
                    @endforeach
                @endif
            </tbody>
        </table>
    @endif

    <div class="signature-section">
        <div class="sig-box">
            <p>Mengetahui / Disetujui,</p>
            <p><strong>Direktur CV Tihani Mafaza</strong></p>
            <div class="sig-space"></div>
            <p><u>( .................................................. )</u></p>
        </div>
        <div class="sig-box" style="float: right;">
            <p>Bandung, {{ date('d F Y') }}</p>
            <p><strong>Bagian Keuangan & Akuntansi</strong></p>
            <div class="sig-space"></div>
            <p><u>Iasha Tsamrotul Fuadi</u><br><span style="font-size: 8px;">NIM: STMIK Mardira Indonesia</span></p>
        </div>
        <div style="clear: both;"></div>
    </div>
</body>
</html>
