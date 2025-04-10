package org.consistency.megamodel.model;

public enum ConsistencyType {
    STRONG("sc"),
    EVENTUAL("ec"),
    BOUNDED_STALENESS("bs"),
    READ_MY_WRITES("rmw"),
    MONOTONIC_READS("mr");
    
    private final String code;
    
    ConsistencyType(String code) {
        this.code = code;
    }
    
    public String getCode() {
        return code;
    }
}