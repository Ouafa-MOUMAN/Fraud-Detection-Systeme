package com.fraudwatch.backend.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Map;

@Document(collection = "transactions")
public class Transaction {

    @Id
    private String id;

    @Indexed(unique = true)
    private Long transactionId;

    private Long transactionDT;
    private Double transactionAmt;
    private String productCD;

    private String card1;
    private String card2;
    private String card3;
    private String card4;
    private String card5;
    private String card6;

    private String addr1;
    private String addr2;

    private Double dist1;
    private Double dist2;

    private String pEmaildomain;
    private String rEmaildomain;

    private Map<String, Object> cFields;  // C1-C14
    private Map<String, Object> dFields;  // D1-D15
    private Map<String, String> mFields;  // M1-M9 (T/F/NaN)

    /** Historical fraud label: 1 = fraud, 0 = legitimate, null = unknown (test set) */
    private Integer isFraud;

    private Instant importedAt;

    public Transaction() {
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Long getTransactionId() { return transactionId; }
    public void setTransactionId(Long transactionId) { this.transactionId = transactionId; }

    public Long getTransactionDT() { return transactionDT; }
    public void setTransactionDT(Long transactionDT) { this.transactionDT = transactionDT; }

    public Double getTransactionAmt() { return transactionAmt; }
    public void setTransactionAmt(Double transactionAmt) { this.transactionAmt = transactionAmt; }

    public String getProductCD() { return productCD; }
    public void setProductCD(String productCD) { this.productCD = productCD; }

    public String getCard1() { return card1; }
    public void setCard1(String card1) { this.card1 = card1; }

    public String getCard2() { return card2; }
    public void setCard2(String card2) { this.card2 = card2; }

    public String getCard3() { return card3; }
    public void setCard3(String card3) { this.card3 = card3; }

    public String getCard4() { return card4; }
    public void setCard4(String card4) { this.card4 = card4; }

    public String getCard5() { return card5; }
    public void setCard5(String card5) { this.card5 = card5; }

    public String getCard6() { return card6; }
    public void setCard6(String card6) { this.card6 = card6; }

    public String getAddr1() { return addr1; }
    public void setAddr1(String addr1) { this.addr1 = addr1; }

    public String getAddr2() { return addr2; }
    public void setAddr2(String addr2) { this.addr2 = addr2; }

    public Double getDist1() { return dist1; }
    public void setDist1(Double dist1) { this.dist1 = dist1; }

    public Double getDist2() { return dist2; }
    public void setDist2(Double dist2) { this.dist2 = dist2; }

    public String getPEmaildomain() { return pEmaildomain; }
    public void setPEmaildomain(String pEmaildomain) { this.pEmaildomain = pEmaildomain; }

    public String getREmaildomain() { return rEmaildomain; }
    public void setREmaildomain(String rEmaildomain) { this.rEmaildomain = rEmaildomain; }

    public Map<String, Object> getCFields() { return cFields; }
    public void setCFields(Map<String, Object> cFields) { this.cFields = cFields; }

    public Map<String, Object> getDFields() { return dFields; }
    public void setDFields(Map<String, Object> dFields) { this.dFields = dFields; }

    public Map<String, String> getMFields() { return mFields; }
    public void setMFields(Map<String, String> mFields) { this.mFields = mFields; }

    public Integer getIsFraud() { return isFraud; }
    public void setIsFraud(Integer isFraud) { this.isFraud = isFraud; }

    public Instant getImportedAt() { return importedAt; }
    public void setImportedAt(Instant importedAt) { this.importedAt = importedAt; }
}
