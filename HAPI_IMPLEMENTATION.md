# HAPI Server Integration - Implementation Summary

This document summarizes the changes made to integrate HAPI server functionality into the explore-data task flow.

## Overview

The explore-data task flow now connects to live HAPI (Heliophysics Application Programmer's Interface) servers to browse and explore available datasets, similar to the HAPI Data Explorer at https://hapi-server.org/servers/.

## Changes Made

### 1. New Components

#### `src/pages/explore-data/-components/HapiServerSelector.tsx`

- Dropdown selector component for choosing between HAPI servers
- Includes 4 commonly-used HAPI servers:
  - SSCWeb (https://sscweb.gsfc.nasa.gov/WS/hapi)
