package com.senai.experience.controllers;

import com.senai.experience.DTO.request.PessoaFisicaRequest;
import com.senai.experience.DTO.response.PessoaFisicaResponse;
import com.senai.experience.entities.PessoaFisica;
import com.senai.experience.mappers.PessoaFisicaMapper;
import com.senai.experience.services.PessoaFisicaService;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/pessoaFisica")
public class PessoaFisicaController {

    private final PessoaFisicaService service;

    public PessoaFisicaController(PessoaFisicaService service) {
        this.service = service;
    }

    @GetMapping
    public Page<PessoaFisicaResponse> getAll(Pageable pageable) {
        return service.findAll(pageable).map(PessoaFisicaMapper::toResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PessoaFisicaResponse> getById(@PathVariable Long id) {
        PessoaFisica pessoaFisica = service.findById(id);
        if (pessoaFisica != null) {
            return ResponseEntity.ok(PessoaFisicaMapper.toResponse(pessoaFisica));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<PessoaFisicaResponse> create(@RequestBody PessoaFisicaRequest dto) {
        PessoaFisica entity = PessoaFisicaMapper.toEntity(dto);
        PessoaFisica salvo = service.save(entity);
        return ResponseEntity.status(201).body(PessoaFisicaMapper.toResponse(salvo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<PessoaFisicaResponse> update(@PathVariable Long id, @RequestBody PessoaFisicaRequest dto) {
        PessoaFisica existingPessoaFisica = service.findById(id);
        if (existingPessoaFisica != null) {
            PessoaFisica entity = PessoaFisicaMapper.toEntity(dto);
            entity.setId(id);
            return ResponseEntity.ok(PessoaFisicaMapper.toResponse(service.update(entity)));
        }
        return ResponseEntity.notFound().build();
    }
}