package com.gitcompare.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    @GetMapping("/awake")
    public ResponseEntity<Map<String, String>> awake() {
        return ResponseEntity.ok(Map.of(
            "status", "online",
            "message", "GitCompare Engine is active and ready."
        ));
    }
}
