package org.consistency.megamodel.model;

public enum ComponentState {
    MODIFIED("m"),
    SHARED_PLUS("s+"),
    SHARED_MINUS("s-"),
    INVALID("i");
    
    private final String code;
    
    ComponentState(String code) {
        this.code = code;
    }
    
    public String getCode() {
        return code;
    }
}